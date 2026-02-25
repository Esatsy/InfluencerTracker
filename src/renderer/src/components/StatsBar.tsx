import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@iconify/react'
import type { Influencer } from '../types/influencer'
import type { AppSettings } from '../types/settings'
import { formatCount } from '../lib/utils'
import { useMouseGlow } from '../hooks/useMouseGlow'

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
      setCurrent(Math.round(start + diff * eased))
      if (progress < 1) requestAnimationFrame(tick)
      else prev.current = target
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

interface StatItem {
  label: string
  rawValue: number
  color: string
  icon: string
}

function StatCard({ label, rawValue, color, icon, delay }: StatItem & { delay: number }) {
  const animated = useAnimatedNumber(rawValue)
  const displayValue = rawValue > 0 ? formatCount(animated) : '-'
  const glow = useMouseGlow()

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, delay, ease: [0.4, 0, 0.2, 1] }}
      {...glow}
      className="flashlight flashlight-border flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/5"
    >
      <span className="text-gray-400 dark:text-gray-500">
        <Icon icon={icon} width={14} />
      </span>
      <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">{label}</span>
      <span className={`text-xs font-bold tabular-nums ${color}`}>{displayValue}</span>
    </motion.div>
  )
}

export function StatsBar({ data, settings }: StatsBarProps) {
  const platforms = settings.platforms || ['instagram', 'tiktok', 'youtube']
  const [page, setPage] = useState(0)

  const igAvg = avg(data.map((d) => d.instagram_followers))
  const ttAvg = avg(data.map((d) => d.tiktok_followers))
  const ytAvg = avg(data.map((d) => d.youtube_followers))
  const igER = data.filter((d) => d.ig_engagement_rate > 0)
  const avgER = igER.length
    ? Math.round((igER.reduce((a, b) => a + b.ig_engagement_rate, 0) / igER.length) * 100) / 100
    : 0

  const pages: StatItem[][] = [
    [
      { label: 'Toplam', rawValue: data.length, color: 'text-indigo-600 dark:text-indigo-400', icon: 'solar:users-group-rounded-bold-duotone' },
      ...(platforms.includes('instagram') ? [{ label: 'Ort. IG', rawValue: igAvg, color: 'text-pink-600 dark:text-pink-400', icon: 'simple-icons:instagram' }] : []),
      ...(platforms.includes('tiktok') ? [{ label: 'Ort. TT', rawValue: ttAvg, color: 'text-teal-500', icon: 'simple-icons:tiktok' }] : []),
    ],
    [
      ...(platforms.includes('youtube') ? [{ label: 'Ort. YT', rawValue: ytAvg, color: 'text-red-500', icon: 'simple-icons:youtube' }] : []),
      ...(platforms.includes('instagram') ? [{ label: 'Ort. ER%', rawValue: avgER, color: 'text-emerald-500', icon: 'solar:chart-bold-duotone' }] : []),
      { label: 'Aktif', rawValue: data.filter((d) => d.instagram_username || d.tiktok_username || d.youtube_username).length, color: 'text-violet-500', icon: 'solar:check-circle-bold-duotone' },
    ],
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setPage((p) => (p + 1) % pages.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [pages.length])

  const currentStats = pages[page] || pages[0]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="flex items-center gap-2 px-5 py-2 overflow-x-auto"
    >
      <motion.button
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setPage((p) => (p - 1 + pages.length) % pages.length)}
        className="p-1 rounded-md text-gray-300 dark:text-gray-600 hover:text-indigo-500 transition-colors shrink-0"
      >
        <Icon icon="solar:alt-arrow-left-bold-duotone" width={16} />
      </motion.button>

      <div className="flex-1 flex items-center gap-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-2"
          >
            {currentStats.map((s, i) => (
              <StatCard key={s.label} {...s} delay={i * 0.05} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <motion.button
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setPage((p) => (p + 1) % pages.length)}
        className="p-1 rounded-md text-gray-300 dark:text-gray-600 hover:text-indigo-500 transition-colors shrink-0"
      >
        <Icon icon="solar:alt-arrow-right-bold-duotone" width={16} />
      </motion.button>

      <div className="flex items-center gap-1 ml-1">
        {pages.map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i)}
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              i === page ? 'bg-indigo-500 w-3' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          />
        ))}
      </div>
    </motion.div>
  )
}
