import type { Influencer } from '../types/influencer'
import type { AppSettings } from '../types/settings'

const BASE = 'http://localhost:3001'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers
    }
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || 'Request failed')
  }
  return res.json()
}

export const api = {
  getSettings(): Promise<AppSettings> {
    return request('/api/settings')
  },

  updateSettings(data: Partial<AppSettings>): Promise<AppSettings> {
    return request('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  },


  getInfluencers(params?: {
    search?: string
    category?: string
    kuyd?: string
  }): Promise<Influencer[]> {
    const qs = new URLSearchParams()
    if (params?.search) qs.set('search', params.search)
    if (params?.category) qs.set('category', params.category)
    if (params?.kuyd) qs.set('kuyd', params.kuyd)
    const q = qs.toString()
    return request(`/api/influencers${q ? `?${q}` : ''}`)
  },

  getInfluencer(id: number): Promise<Influencer> {
    return request(`/api/influencers/${id}`)
  },

  createInfluencer(data: Partial<Influencer>): Promise<Influencer> {
    return request('/api/influencers', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  updateInfluencer(id: number, data: Partial<Influencer>): Promise<Influencer> {
    return request(`/api/influencers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  },

  deleteInfluencer(id: number): Promise<void> {
    return request(`/api/influencers/${id}`, { method: 'DELETE' })
  },

  scrapeInfluencer(id: number): Promise<{ influencer: Influencer; errors: string[] }> {
    return request(`/api/influencers/${id}/scrape`, { method: 'POST' })
  },

  scrapeAll(): Promise<{
    results: { id: number; name: string; errors: string[] }[]
    aborted: boolean
  }> {
    return request('/api/scrape-all', { method: 'POST' })
  },

  abortScrapeAll(): Promise<void> {
    return request('/api/scrape-all/abort', { method: 'POST' })
  },

  async exportExcel(): Promise<void> {
    const res = await fetch(`${BASE}/api/export`)
    if (!res.ok) throw new Error('Export failed')
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `influencers_${new Date().toISOString().slice(0, 10)}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
  },

  async importExcel(file: File): Promise<{ imported: number }> {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`${BASE}/api/import`, { method: 'POST', body: form })
    if (!res.ok) throw new Error('Import failed')
    return res.json()
  }
}
