import { Instagram } from 'lucide-react'
import type { Influencer } from '../types/influencer'
import { formatCount } from '../lib/utils'

interface StatsBarProps {
  data: Influencer[]
}

function avg(nums: number[]): number {
  const valid = nums.filter((n) => n > 0)
  if (!valid.length) return 0
  return Math.round(valid.reduce((a, b) => a + b, 0) / valid.length)
}

export function StatsBar({ data }: StatsBarProps) {
  const igAvg = avg(data.map((d) => d.instagram_followers))
  const ttAvg = avg(data.map((d) => d.tiktok_followers))
  const ytAvg = avg(data.map((d) => d.youtube_followers))

  const stats = [
    { label: 'Toplam', value: String(data.length), color: 'text-blue-600' },
    { label: 'Ort. IG', value: formatCount(igAvg), color: 'text-instagram' },
    { label: 'Ort. TT', value: formatCount(ttAvg), color: 'text-teal-500' },
    { label: 'Ort. YT', value: formatCount(ytAvg), color: 'text-youtube' }
  ]

  return (
    <div className="flex items-center gap-4 px-4 py-1.5 border-b bg-white dark:bg-gray-900 text-xs">
      {stats.map((s) => (
        <div key={s.label} className="flex items-center gap-1.5">
          <span className="text-gray-500">{s.label}:</span>
          <span className={`font-semibold ${s.color}`}>{s.value}</span>
        </div>
      ))}
    </div>
  )
}
