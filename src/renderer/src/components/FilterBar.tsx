import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Filter } from 'lucide-react'
import { CATEGORY_OPTIONS, KUYD_OPTIONS } from '../lib/utils'

interface FilterBarProps {
  search: string
  onSearchChange: (v: string) => void
  category: string
  onCategoryChange: (v: string) => void
  kuyd: string
  onKuydChange: (v: string) => void
}

export function FilterBar({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  kuyd,
  onKuydChange
}: FilterBarProps) {
  const hasFilters = search || category || kuyd
  const activeCount = [search, category, kuyd].filter(Boolean).length

  function clearAll() {
    onSearchChange('')
    onCategoryChange('')
    onKuydChange('')
  }

  return (
    <motion.div
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, delay: 0.05, ease: [0.4, 0, 0.2, 1] }}
      className="flex items-center gap-2.5 px-5 py-2.5 glass-subtle border-b border-white/10 dark:border-white/5"
    >
      <div className="relative flex-1 max-w-sm">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          type="text"
          placeholder="Influencer ara..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="input pl-9 py-1.5 text-xs"
        />
        <AnimatePresence>
          {search && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <X size={12} className="text-gray-400" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-1.5 text-gray-400">
        <Filter size={13} />
      </div>

      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="input w-auto py-1.5 text-xs pr-8"
      >
        <option value="">Tum Kategoriler</option>
        {CATEGORY_OPTIONS.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <select
        value={kuyd}
        onChange={(e) => onKuydChange(e.target.value)}
        className="input w-auto py-1.5 text-xs pr-8"
      >
        <option value="">Tum KUYD</option>
        {KUYD_OPTIONS.map((k) => (
          <option key={k} value={k}>
            {k}
          </option>
        ))}
      </select>

      <AnimatePresence>
        {hasFilters && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, x: -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: -10 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            onClick={clearAll}
            className="btn-ghost btn-sm text-xs flex items-center gap-1 text-indigo-500 dark:text-indigo-400"
          >
            <X size={12} />
            Temizle
            {activeCount > 1 && (
              <span className="ml-0.5 w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
