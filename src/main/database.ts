import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

let db: Database.Database

export interface InfluencerRow {
  id: number
  name: string
  instagram_username: string
  instagram_followers: number
  tiktok_username: string
  tiktok_followers: number
  youtube_username: string
  youtube_followers: number
  categories: string
  women_pct: number
  men_pct: number
  age_13_17: number
  age_18_24: number
  age_25_34: number
  age_35_44: number
  age_45_plus: number
  tr_pct: number
  ig_engagement_rate: number
  kuyd_category: string
  project: string
  notes: string
  last_scraped_at: string | null
  created_at: string
  updated_at: string
}

export interface AppSettings {
  agency_name: string
  agency_type: string
  platforms: string[]
  categories: string[]
  kuyd_options: string[]
  projects: string[]
  visible_columns: string[]
  table_density: 'compact' | 'comfortable' | 'spacious'
  theme: 'system' | 'light' | 'dark'
  currency: string
  language: string
  setup_completed: boolean
}

const DEFAULT_SETTINGS: AppSettings = {
  agency_name: '',
  agency_type: '',
  platforms: ['instagram', 'tiktok', 'youtube'],
  categories: [
    'Fashion', 'Beauty', 'Lifestyle', 'Entertainment', 'Sports',
    'Student', 'Kitchen', 'Art', 'Pet', 'Music', 'Travel',
    'Technology', 'Food', 'Gaming', 'Fitness'
  ],
  kuyd_options: [
    'İş Paola', 'Proje Oluştur', 'İşbirliklerine Odaklan', 'Sabiçöz Kalım'
  ],
  projects: [],
  visible_columns: [
    'name', 'instagram', 'ig_er', 'tiktok', 'youtube',
    'categories', 'demographics', 'ages', 'tr_pct',
    'kuyd', 'project', 'notes'
  ],
  table_density: 'compact',
  theme: 'system',
  currency: 'TRY',
  language: 'tr',
  setup_completed: false
}

export function initDatabase(): void {
  const userDataPath = app.getPath('userData')
  if (!existsSync(userDataPath)) mkdirSync(userDataPath, { recursive: true })

  const dbPath = join(userDataPath, 'influencers.db')
  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')

  db.exec(`
    CREATE TABLE IF NOT EXISTS influencers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      instagram_username TEXT DEFAULT '',
      instagram_followers INTEGER DEFAULT 0,
      tiktok_username TEXT DEFAULT '',
      tiktok_followers INTEGER DEFAULT 0,
      youtube_username TEXT DEFAULT '',
      youtube_followers INTEGER DEFAULT 0,
      categories TEXT DEFAULT '[]',
      women_pct REAL DEFAULT 0,
      men_pct REAL DEFAULT 0,
      age_13_17 REAL DEFAULT 0,
      age_18_24 REAL DEFAULT 0,
      age_25_34 REAL DEFAULT 0,
      age_35_44 REAL DEFAULT 0,
      age_45_plus REAL DEFAULT 0,
      tr_pct REAL DEFAULT 0,
      ig_engagement_rate REAL DEFAULT 0,
      kuyd_category TEXT DEFAULT '',
      project TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      last_scraped_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `)

  try {
    db.exec(`ALTER TABLE influencers ADD COLUMN ig_engagement_rate REAL DEFAULT 0`)
  } catch { /* column already exists */ }
}

export const settingsDB = {
  getAll(): AppSettings {
    const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[]
    const stored: Record<string, unknown> = {}
    for (const row of rows) {
      try { stored[row.key] = JSON.parse(row.value) } catch { stored[row.key] = row.value }
    }
    return { ...DEFAULT_SETTINGS, ...stored } as AppSettings
  },

  get(key: string): unknown {
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined
    if (!row) return (DEFAULT_SETTINGS as Record<string, unknown>)[key]
    try { return JSON.parse(row.value) } catch { return row.value }
  },

  set(key: string, value: unknown): void {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value)
    db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, serialized)
  },

  setMany(data: Record<string, unknown>): void {
    const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)')
    const tx = db.transaction((items: [string, unknown][]) => {
      for (const [key, value] of items) {
        const serialized = typeof value === 'string' ? value : JSON.stringify(value)
        stmt.run(key, serialized)
      }
    })
    tx(Object.entries(data))
  },

  isSetupCompleted(): boolean {
    return this.get('setup_completed') === true
  }
}

export const database = {
  getAll(filters: {
    search?: string
    category?: string
    kuyd?: string
  }): InfluencerRow[] {
    let query = 'SELECT * FROM influencers WHERE 1=1'
    const params: unknown[] = []

    if (filters.search) {
      query +=
        ' AND (name LIKE ? OR instagram_username LIKE ? OR tiktok_username LIKE ? OR youtube_username LIKE ?)'
      const s = `%${filters.search}%`
      params.push(s, s, s, s)
    }
    if (filters.category) {
      query += ' AND categories LIKE ?'
      params.push(`%${filters.category}%`)
    }
    if (filters.kuyd) {
      query += ' AND kuyd_category = ?'
      params.push(filters.kuyd)
    }

    query += ' ORDER BY id ASC'
    return db.prepare(query).all(...params) as InfluencerRow[]
  },

  getById(id: number): InfluencerRow | undefined {
    return db.prepare('SELECT * FROM influencers WHERE id = ?').get(id) as
      | InfluencerRow
      | undefined
  },

  create(data: Partial<InfluencerRow>): number {
    const stmt = db.prepare(`
      INSERT INTO influencers
        (name, instagram_username, instagram_followers, tiktok_username, tiktok_followers,
         youtube_username, youtube_followers, categories, women_pct, men_pct,
         age_13_17, age_18_24, age_25_34, age_35_44, age_45_plus,
         tr_pct, ig_engagement_rate, kuyd_category, project, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const result = stmt.run(
      data.name || '',
      data.instagram_username || '',
      data.instagram_followers || 0,
      data.tiktok_username || '',
      data.tiktok_followers || 0,
      data.youtube_username || '',
      data.youtube_followers || 0,
      typeof data.categories === 'string' ? data.categories : JSON.stringify(data.categories || []),
      data.women_pct || 0,
      data.men_pct || 0,
      data.age_13_17 || 0,
      data.age_18_24 || 0,
      data.age_25_34 || 0,
      data.age_35_44 || 0,
      data.age_45_plus || 0,
      data.tr_pct || 0,
      data.ig_engagement_rate || 0,
      data.kuyd_category || '',
      data.project || '',
      data.notes || ''
    )

    return result.lastInsertRowid as number
  },

  update(id: number, data: Partial<InfluencerRow>): void {
    const fields: string[] = []
    const values: unknown[] = []

    const allowed = [
      'name',
      'instagram_username',
      'instagram_followers',
      'tiktok_username',
      'tiktok_followers',
      'youtube_username',
      'youtube_followers',
      'categories',
      'women_pct',
      'men_pct',
      'age_13_17',
      'age_18_24',
      'age_25_34',
      'age_35_44',
      'age_45_plus',
      'tr_pct',
      'ig_engagement_rate',
      'kuyd_category',
      'project',
      'notes',
      'last_scraped_at'
    ]

    for (const field of allowed) {
      const val = (data as Record<string, unknown>)[field]
      if (val !== undefined) {
        fields.push(`${field} = ?`)
        if (field === 'categories' && Array.isArray(val)) {
          values.push(JSON.stringify(val))
        } else {
          values.push(val)
        }
      }
    }

    if (fields.length === 0) return

    fields.push("updated_at = datetime('now')")
    values.push(id)

    db.prepare(`UPDATE influencers SET ${fields.join(', ')} WHERE id = ?`).run(...values)
  },

  delete(id: number): void {
    db.prepare('DELETE FROM influencers WHERE id = ?').run(id)
  },

  deleteAll(): void {
    db.prepare('DELETE FROM influencers').run()
  },

  bulkCreate(rows: Partial<InfluencerRow>[]): void {
    const insert = db.prepare(`
      INSERT INTO influencers
        (name, instagram_username, instagram_followers, tiktok_username, tiktok_followers,
         youtube_username, youtube_followers, categories, women_pct, men_pct,
         age_13_17, age_18_24, age_25_34, age_35_44, age_45_plus,
         tr_pct, ig_engagement_rate, kuyd_category, project, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const tx = db.transaction((items: Partial<InfluencerRow>[]) => {
      for (const d of items) {
        insert.run(
          d.name || '',
          d.instagram_username || '',
          d.instagram_followers || 0,
          d.tiktok_username || '',
          d.tiktok_followers || 0,
          d.youtube_username || '',
          d.youtube_followers || 0,
          typeof d.categories === 'string' ? d.categories : JSON.stringify(d.categories || []),
          d.women_pct || 0,
          d.men_pct || 0,
          d.age_13_17 || 0,
          d.age_18_24 || 0,
          d.age_25_34 || 0,
          d.age_35_44 || 0,
          d.age_45_plus || 0,
          d.tr_pct || 0,
          d.ig_engagement_rate || 0,
          d.kuyd_category || '',
          d.project || '',
          d.notes || ''
        )
      }
    })

    tx(rows)
  }
}
