import https from 'https'

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
]

function randomUA(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
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

export async function scrapeTikTok(username: string): Promise<number | null> {
  if (!username) return null
  const clean = username.replace(/^@/, '').trim()
  if (!clean) return null

  try {
    const html = await httpsGet(`https://www.tiktok.com/@${clean}`, {
      'User-Agent': randomUA(),
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9'
    })

    // Method 1: __UNIVERSAL_DATA_FOR_REHYDRATION__ JSON
    const universalMatch = html.match(
      /id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>(.*?)<\/script>/s
    )
    if (universalMatch) {
      try {
        const data = JSON.parse(universalMatch[1])
        const userDetail = data?.__DEFAULT_SCOPE__?.['webapp.user-detail']
        const followers = userDetail?.userInfo?.stats?.followerCount
        if (typeof followers === 'number') return followers
      } catch {
        /* parse error, try next */
      }
    }

    // Method 2: SIGI_STATE JSON
    const sigiMatch = html.match(/SIGI_STATE\s*=\s*({.*?})\s*;\s*<\/script>/s)
    if (sigiMatch) {
      try {
        const data = JSON.parse(sigiMatch[1])
        const statsMap = data?.UserModule?.stats
        if (statsMap) {
          const key = Object.keys(statsMap)[0]
          if (key && typeof statsMap[key]?.followerCount === 'number') {
            return statsMap[key].followerCount
          }
        }
      } catch {
        /* parse error */
      }
    }

    return null
  } catch {
    return null
  }
}
