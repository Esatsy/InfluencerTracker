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

export const ALL_COLUMNS = [
  { id: 'name', label: 'Influencer Adi', required: true },
  { id: 'instagram', label: 'Instagram Takipci' },
  { id: 'ig_er', label: 'Instagram ER%' },
  { id: 'tiktok', label: 'TikTok Takipci' },
  { id: 'youtube', label: 'YouTube Abone' },
  { id: 'categories', label: 'Kategoriler' },
  { id: 'demographics', label: 'Cinsiyet (K/E %)' },
  { id: 'ages', label: 'Yas Dagilimlari' },
  { id: 'tr_pct', label: 'TR %' },
  { id: 'kuyd', label: 'KUYD Kategori' },
  { id: 'project', label: 'Proje' },
  { id: 'notes', label: 'Notlar' }
] as const

export const AGENCY_TYPES = [
  'Reklam Ajansi',
  'Dijital Pazarlama',
  'Influencer Yonetimi',
  'Sosyal Medya Ajansi',
  'PR & Iletisim',
  'Marka Danismanligi',
  'Diger'
]

export const PLATFORM_OPTIONS = [
  { id: 'instagram', label: 'Instagram', color: '#E1306C' },
  { id: 'tiktok', label: 'TikTok', color: '#00F2EA' },
  { id: 'youtube', label: 'YouTube', color: '#FF0000' }
]

export const DEFAULT_CATEGORIES = [
  'Fashion', 'Beauty', 'Lifestyle', 'Entertainment', 'Sports',
  'Student', 'Kitchen', 'Art', 'Pet', 'Music', 'Travel',
  'Technology', 'Food', 'Gaming', 'Fitness'
]
