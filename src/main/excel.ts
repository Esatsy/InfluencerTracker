import ExcelJS from 'exceljs'
import type { InfluencerRow } from './database'

function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
  return String(n)
}

export async function exportToExcel(influencers: InfluencerRow[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Influencers')

  const headerStyle: Partial<ExcelJS.Style> = {
    font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } },
    alignment: { horizontal: 'center', vertical: 'middle' },
    border: {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' }
    }
  }

  sheet.columns = [
    { header: 'No', key: 'no', width: 5 },
    { header: 'Influencer', key: 'name', width: 20 },
    { header: 'Instagram', key: 'ig', width: 12 },
    { header: 'IG ER%', key: 'ig_er', width: 8 },
    { header: 'TikTok', key: 'tt', width: 12 },
    { header: 'YouTube', key: 'yt', width: 12 },
    { header: 'Kategoriler', key: 'categories', width: 30 },
    { header: 'Women %', key: 'women', width: 10 },
    { header: 'Men %', key: 'men', width: 10 },
    { header: '13-17', key: 'a1317', width: 8 },
    { header: '18-24', key: 'a1824', width: 8 },
    { header: '25-34', key: 'a2534', width: 8 },
    { header: '35-44', key: 'a3544', width: 8 },
    { header: '45+', key: 'a45', width: 8 },
    { header: 'TR %', key: 'tr', width: 8 },
    { header: 'KUYD Kategori', key: 'kuyd', width: 20 },
    { header: 'Proje', key: 'project', width: 15 },
    { header: 'Not', key: 'notes', width: 30 }
  ]

  const headerRow = sheet.getRow(1)
  headerRow.eachCell((cell) => {
    cell.style = headerStyle
  })
  headerRow.height = 28

  influencers.forEach((inf, idx) => {
    let cats: string[]
    try {
      cats = JSON.parse(inf.categories || '[]')
    } catch {
      cats = []
    }

    sheet.addRow({
      no: idx + 1,
      name: inf.name,
      ig: inf.instagram_followers ? formatCount(inf.instagram_followers) : '-',
      ig_er: inf.ig_engagement_rate ? `${inf.ig_engagement_rate}%` : '-',
      tt: inf.tiktok_followers ? formatCount(inf.tiktok_followers) : '-',
      yt: inf.youtube_followers ? formatCount(inf.youtube_followers) : '-',
      categories: cats.join(', '),
      women: inf.women_pct ? `${inf.women_pct}%` : '-',
      men: inf.men_pct ? `${inf.men_pct}%` : '-',
      a1317: inf.age_13_17 ? `${inf.age_13_17}%` : '-',
      a1824: inf.age_18_24 ? `${inf.age_18_24}%` : '-',
      a2534: inf.age_25_34 ? `${inf.age_25_34}%` : '-',
      a3544: inf.age_35_44 ? `${inf.age_35_44}%` : '-',
      a45: inf.age_45_plus ? `${inf.age_45_plus}%` : '-',
      tr: inf.tr_pct ? `${inf.tr_pct}%` : '-',
      kuyd: inf.kuyd_category,
      project: inf.project,
      notes: inf.notes
    })
  })

  // Style data rows
  for (let i = 2; i <= influencers.length + 1; i++) {
    const row = sheet.getRow(i)
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        right: { style: 'thin', color: { argb: 'FFE0E0E0' } }
      }
      cell.font = { size: 9 }
    })
    if (i % 2 === 0) {
      row.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F9FA' } }
      })
    }
  }

  const buf = await workbook.xlsx.writeBuffer()
  return Buffer.from(buf)
}

function parseExcelCount(val: unknown): number {
  if (typeof val === 'number') return val
  if (typeof val !== 'string') return 0
  const clean = val.replace(/[,%]/g, '').trim()
  const match = clean.match(/([\d.]+)\s*([KMB])?/i)
  if (!match) return 0
  const num = parseFloat(match[1])
  const suffix = (match[2] || '').toUpperCase()
  switch (suffix) {
    case 'K':
      return Math.round(num * 1_000)
    case 'M':
      return Math.round(num * 1_000_000)
    case 'B':
      return Math.round(num * 1_000_000_000)
    default:
      return Math.round(num)
  }
}

function parsePercent(val: unknown): number {
  if (typeof val === 'number') return val
  if (typeof val !== 'string') return 0
  const n = parseFloat(val.replace('%', '').replace(',', '.').trim())
  return isNaN(n) ? 0 : n
}

export async function importFromExcel(buffer: Buffer): Promise<Partial<InfluencerRow>[]> {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(buffer)

  const sheet = workbook.worksheets[0]
  if (!sheet) return []

  const rows: Partial<InfluencerRow>[] = []

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return

    const vals = row.values as unknown[]
    if (!vals || vals.length < 3) return

    const name = String(vals[2] || '').trim()
    if (!name) return

    rows.push({
      name,
      instagram_followers: parseExcelCount(vals[3]),
      tiktok_followers: parseExcelCount(vals[4]),
      youtube_followers: parseExcelCount(vals[5]),
      categories: JSON.stringify(
        String(vals[6] || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      ),
      women_pct: parsePercent(vals[7]),
      men_pct: parsePercent(vals[8]),
      age_13_17: parsePercent(vals[9]),
      age_18_24: parsePercent(vals[10]),
      age_25_34: parsePercent(vals[11]),
      age_35_44: parsePercent(vals[12]),
      age_45_plus: parsePercent(vals[13]),
      tr_pct: parsePercent(vals[14]),
      kuyd_category: String(vals[15] || ''),
      project: String(vals[16] || ''),
      notes: String(vals[17] || '')
    })
  })

  return rows
}
