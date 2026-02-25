import { Search, X } from 'lucide-react'
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

  function clearAll() {
    onSearchChange('')
    onCategoryChange('')
    onKuydChange('')
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border-b">
      <div className="relative flex-1 max-w-xs">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Influencer ara..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="input pl-8 py-1.5 text-xs"
        />
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

      {hasFilters && (
        <button onClick={clearAll} className="btn-ghost btn-sm text-xs text-gray-500">
          <X size={12} />
          Temizle
        </button>
      )}
    </div>
  )
}
