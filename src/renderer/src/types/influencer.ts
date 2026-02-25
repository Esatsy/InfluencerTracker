export interface Influencer {
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
