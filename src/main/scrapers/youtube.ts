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

export async function scrapeYouTube(handle: string): Promise<number | null> {
  if (!handle) return null
  const clean = handle.replace(/^@/, '').trim()
  if (!clean) return null

  try {
    const html = await httpsGet(`https://www.youtube.com/@${clean}`, {
      'User-Agent': randomUA(),
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9'
    })

    // The first subscriberCountText in the page is the channel's own count
    const subMatch = html.match(
      /"subscriberCountText".*?"simpleText"\s*:\s*"([^"]+)"/
    )
    if (subMatch) {
      const count = parseSubscriberText(subMatch[1])
      if (count !== null) return count
    }

    return null
  } catch {
    return null
  }
}

function parseSubscriberText(text: string): number | null {
  const clean = text.replace(/subscribers?/gi, '').replace(/,/g, '').trim()
  const match = clean.match(/([\d.]+)\s*([KMB])?/i)
  if (!match) return null
  const num = parseFloat(match[1])
  const suffix = (match[2] || '').toUpperCase()
  switch (suffix) {
    case 'K': return Math.round(num * 1_000)
    case 'M': return Math.round(num * 1_000_000)
    case 'B': return Math.round(num * 1_000_000_000)
    default: return Math.round(num)
  }
}
