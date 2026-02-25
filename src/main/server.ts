import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { database, settingsDB, type InfluencerRow } from './database'
import { scrapeInfluencer } from './scrapers'
import { exportToExcel, importFromExcel } from './excel'

const upload = multer({ storage: multer.memoryStorage() })

export function createServer(): express.Express {
  const app = express()
  app.use(cors())
  app.use(express.json())

  // --- Settings ---

  app.get('/api/settings', (_req, res) => {
    res.json(settingsDB.getAll())
  })

  app.put('/api/settings', (req, res) => {
    settingsDB.setMany(req.body)
    res.json(settingsDB.getAll())
  })

  app.get('/api/settings/:key', (req, res) => {
    res.json({ value: settingsDB.get(req.params.key) })
  })

  // --- Influencer CRUD ---

  app.get('/api/influencers', (req, res) => {
    const { search, category, kuyd } = req.query as Record<string, string>
    const data = database.getAll({ search, category, kuyd })
    res.json(data)
  })

  app.get('/api/influencers/:id', (req, res) => {
    const inf = database.getById(Number(req.params.id))
    if (!inf) return res.status(404).json({ error: 'Not found' })
    res.json(inf)
  })

  app.post('/api/influencers', (req, res) => {
    const id = database.create(req.body)
    const created = database.getById(id)
    res.status(201).json(created)
  })

  app.put('/api/influencers/:id', (req, res) => {
    const id = Number(req.params.id)
    const existing = database.getById(id)
    if (!existing) return res.status(404).json({ error: 'Not found' })
    database.update(id, req.body)
    const updated = database.getById(id)
    res.json(updated)
  })

  app.delete('/api/influencers/:id', (req, res) => {
    database.delete(Number(req.params.id))
    res.json({ success: true })
  })

  // --- Scraping ---

  app.post('/api/influencers/:id/scrape', async (req, res) => {
    try {
      const inf = database.getById(Number(req.params.id))
      if (!inf) return res.status(404).json({ error: 'Not found' })

      const result = await scrapeInfluencer({
        instagram_username: inf.instagram_username,
        tiktok_username: inf.tiktok_username,
        youtube_username: inf.youtube_username
      })

      const updates: Partial<InfluencerRow> = { last_scraped_at: new Date().toISOString() }
      if (result.instagram_followers !== null && result.instagram_followers !== undefined) {
        updates.instagram_followers = result.instagram_followers
      }
      if (result.ig_engagement_rate !== null && result.ig_engagement_rate !== undefined) {
        updates.ig_engagement_rate = result.ig_engagement_rate
      }
      if (result.tiktok_followers !== null && result.tiktok_followers !== undefined) {
        updates.tiktok_followers = result.tiktok_followers
      }
      if (result.youtube_followers !== null && result.youtube_followers !== undefined) {
        updates.youtube_followers = result.youtube_followers
      }

      database.update(inf.id, updates)
      const updated = database.getById(inf.id)
      res.json({ influencer: updated, errors: result.errors })
    } catch (err) {
      res.status(500).json({ error: 'Scraping failed', details: String(err) })
    }
  })

  let scrapeAllAbort = false

  app.post('/api/scrape-all', async (_req, res) => {
    scrapeAllAbort = false
    const all = database.getAll({})
    const results: { id: number; name: string; errors: string[] }[] = []

    for (const inf of all) {
      if (scrapeAllAbort) break

      const hasUsernames =
        inf.instagram_username || inf.tiktok_username || inf.youtube_username
      if (!hasUsernames) continue

      try {
        const result = await scrapeInfluencer({
          instagram_username: inf.instagram_username,
          tiktok_username: inf.tiktok_username,
          youtube_username: inf.youtube_username
        })

        const updates: Partial<InfluencerRow> = { last_scraped_at: new Date().toISOString() }
        if (result.instagram_followers !== null && result.instagram_followers !== undefined)
          updates.instagram_followers = result.instagram_followers
        if (result.ig_engagement_rate !== null && result.ig_engagement_rate !== undefined)
          updates.ig_engagement_rate = result.ig_engagement_rate
        if (result.tiktok_followers !== null && result.tiktok_followers !== undefined)
          updates.tiktok_followers = result.tiktok_followers
        if (result.youtube_followers !== null && result.youtube_followers !== undefined)
          updates.youtube_followers = result.youtube_followers

        database.update(inf.id, updates)
        results.push({ id: inf.id, name: inf.name, errors: result.errors })
      } catch {
        results.push({ id: inf.id, name: inf.name, errors: ['Beklenmeyen hata'] })
      }
    }

    res.json({ results, aborted: scrapeAllAbort })
  })

  app.post('/api/scrape-all/abort', (_req, res) => {
    scrapeAllAbort = true
    res.json({ success: true })
  })

  // --- Excel Export / Import ---

  app.get('/api/export', async (_req, res) => {
    try {
      const data = database.getAll({})
      const buffer = await exportToExcel(data)
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      )
      res.setHeader('Content-Disposition', 'attachment; filename=influencers.xlsx')
      res.send(buffer)
    } catch (err) {
      res.status(500).json({ error: 'Export failed', details: String(err) })
    }
  })

  app.post('/api/import', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

      const rows = await importFromExcel(req.file.buffer)
      database.bulkCreate(rows)
      res.json({ imported: rows.length })
    } catch (err) {
      res.status(500).json({ error: 'Import failed', details: String(err) })
    }
  })

  return app
}

export function startServer(port = 3001): Promise<number> {
  return new Promise((resolve) => {
    const app = createServer()
    const server = app.listen(port, () => {
      console.log(`API server running on http://localhost:${port}`)
      resolve(port)
    })
    server.on('error', () => {
      // Port in use — try next
      const next = port + 1
      const s2 = app.listen(next, () => {
        console.log(`API server running on http://localhost:${next}`)
        resolve(next)
      })
      s2.on('error', () => resolve(0))
    })
  })
}
