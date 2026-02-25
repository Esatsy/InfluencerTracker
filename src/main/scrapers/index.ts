import { scrapeInstagram } from './instagram'
import { scrapeTikTok } from './tiktok'
import { scrapeYouTube } from './youtube'

export interface ScrapeResult {
  instagram_followers?: number | null
  ig_engagement_rate?: number | null
  tiktok_followers?: number | null
  youtube_followers?: number | null
  errors: string[]
}

const DELAY_MS = 2000

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function scrapeInfluencer(influencer: {
  instagram_username?: string
  tiktok_username?: string
  youtube_username?: string
}): Promise<ScrapeResult> {
  const result: ScrapeResult = { errors: [] }

  if (influencer.instagram_username) {
    try {
      const ig = await scrapeInstagram(influencer.instagram_username)
      result.instagram_followers = ig.followers
      result.ig_engagement_rate = ig.engagementRate
      if (ig.followers === null) {
        result.errors.push('Instagram: veri alinamadi')
      }
    } catch {
      result.errors.push('Instagram: baglanti hatasi')
    }
    await delay(DELAY_MS)
  }

  if (influencer.tiktok_username) {
    try {
      result.tiktok_followers = await scrapeTikTok(influencer.tiktok_username)
      if (result.tiktok_followers === null) {
        result.errors.push('TikTok: veri alinamadi')
      }
    } catch {
      result.errors.push('TikTok: baglanti hatasi')
    }
    await delay(DELAY_MS)
  }

  if (influencer.youtube_username) {
    try {
      result.youtube_followers = await scrapeYouTube(influencer.youtube_username)
      if (result.youtube_followers === null) {
        result.errors.push('YouTube: veri alinamadi')
      }
    } catch {
      result.errors.push('YouTube: baglanti hatasi')
    }
  }

  return result
}

export { scrapeInstagram, scrapeTikTok, scrapeYouTube }
