import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, TrendingUp } from 'lucide-react'
import type { Influencer } from '../types/influencer'
import type { AppSettings } from '../types/settings'
import { formatCount } from '../lib/utils'

interface StatsBarProps {
  data: Influencer[]
  settings: AppSettings
}

function useAnimatedNumber(target: number, duration = 600): number {
  const [current, setCurrent] = useState(0)
  const prev = useRef(0)

  useEffect(() => {
    const start = prev.current
    const diff = target - start
    if (diff === 0) return

    const startTime = performance.now()

    function tick(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const val = Math.round(start + diff * eased)
      setCurrent(val)

      if (progress < 1) {
        requestAnimationFrame(tick)
      } else {
        prev.current = target
      }
    }

    requestAnimationFrame(tick)
  }, [target, duration])

  return current
}

function avg(nums: number[]): number {
  const valid = nums.filter((n) => n > 0)
  if (!valid.length) return 0
  return Math.round(valid.reduce((a, b) => a + b, 0) / valid.length)
}

function StatCard({
  label,
  value,
  rawValue,
  color,
  icon,
  delay
}: {
  label: string
  value: string
  rawValue: number
  color: string
  icon?: React.ReactNode
  delay: number
}) {
  const animated = useAnimatedNumber(rawValue)
  const displayValue = rawValue > 0 ? formatCount(animated) : value

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.4, 0, 0.2, 1] }}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/5"
    >
      {icon && <span className="text-gray-400 dark:text-gray-500">{icon}</span>}
      <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">{label}</span>
      <span className={`text-xs font-bold tabular-nums ${color}`}>{displayValue}</span>
    </motion.div>
  )
}

export function StatsBar({ data, settings }: StatsBarProps) {
  const igAvg = avg(data.map((d) => d.instagram_followers))
  const ttAvg = avg(data.map((d) => d.tiktok_followers))
  const ytAvg = avg(data.map((d) => d.youtube_followers))

  const platforms = settings.platforms || ['instagram', 'tiktok', 'youtube']

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="flex items-center gap-2 px-5 py-2 overflow-x-auto"
    >
      <StatCard
        label="Toplam"
        value={String(data.length)}
        rawValue={data.length}
        color="text-indigo-600 dark:text-indigo-400"
        icon={<Users size={13} />}
        delay={0.1}
      />
      {platforms.includes('instagram') && (
        <StatCard
          label="Ort. IG"
          value={formatCount(igAvg)}
          rawValue={igAvg}
          color="text-pink-600 dark:text-pink-400"
          icon={<TrendingUp size={13} />}
          delay={0.15}
        />
      )}
      {platforms.includes('tiktok') && (
        <StatCard
          label="Ort. TT"
          value={formatCount(ttAvg)}
          rawValue={ttAvg}
          color="text-teal-500"
          delay={0.2}
        />
      )}
      {platforms.includes('youtube') && (
        <StatCard
          label="Ort. YT"
          value={formatCount(ytAvg)}
          rawValue={ytAvg}
          color="text-red-500"
          delay={0.25}
        />
      )}
    </motion.div>
  )
}
