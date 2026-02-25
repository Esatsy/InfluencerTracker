import https from 'https'

const IG_APP_ID = '936619743392459'
const MOBILE_UA =
  'Instagram 275.0.0.27.98 Android (33/13; 420dpi; 1080x2400; samsung; SM-G991B; o1s; exynos2100; en_US; 458229258)'

export interface InstagramResult {
  followers: number | null
  engagementRate: number | null
}

function httpsGet(url: string, headers: Record<string, string>): Promise<string> {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers }, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return httpsGet(res.headers.location, headers).then(resolve, reject)
        }
        let data = ''
        res.on('data', (chunk) => (data += chunk))
        res.on('end', () => resolve(data))
      })
      .on('error', reject)
  })
}

export async function scrapeInstagram(username: string): Promise<InstagramResult> {
  const empty: InstagramResult = { followers: null, engagementRate: null }
  if (!username) return empty
  const clean = username.replace(/^@/, '').trim()
  if (!clean) return empty

  try {
    const url = `https://i.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(clean)}`
    const body = await httpsGet(url, {
      'User-Agent': MOBILE_UA,
      'X-IG-App-ID': IG_APP_ID
    })

    const json = JSON.parse(body)
    const user = json?.data?.user
    if (!user) return empty

    const followers =
      user?.edge_followed_by?.count ?? user?.follower_count ?? null

    if (typeof followers !== 'number' || followers === 0) {
      return { followers, engagementRate: null }
    }

    // Calculate engagement rate from recent posts
    const posts = user?.edge_owner_to_timeline_media?.edges
    let engagementRate: number | null = null

    if (Array.isArray(posts) && posts.length > 0) {
      let totalEngagement = 0
      let count = 0

      for (const edge of posts) {
        const node = edge?.node
        if (!node) continue

        const likes =
          node?.edge_liked_by?.count ??
          node?.edge_media_preview_like?.count ??
          0
        const comments =
          node?.edge_media_to_comment?.count ??
          node?.edge_media_preview_comment?.count ??
          0

        totalEngagement += likes + comments
        count++
      }

      if (count > 0) {
        const avgEngagement = totalEngagement / count
        engagementRate = Math.round((avgEngagement / followers) * 10000) / 100
      }
    }

    return { followers, engagementRate }
  } catch {
    return empty
  }
}
