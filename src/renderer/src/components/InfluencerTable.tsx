import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  type ColumnDef,
  flexRender
} from '@tanstack/react-table'
import {
  Pencil,
  Trash2,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  Users,
  Sparkles
} from 'lucide-react'
import type { Influencer } from '../types/influencer'
import type { AppSettings } from '../types/settings'
import { formatCount, parseCategories, cn } from '../lib/utils'
import { useScrapeInfluencer, useDeleteInfluencer } from '../hooks/useInfluencers'
import toast from 'react-hot-toast'

interface InfluencerTableProps {
  data: Influencer[]
  onEdit: (inf: Influencer) => void
  isLoading: boolean
  settings: AppSettings
}

function PlatformBadge({
  value,
  platform
}: {
  value: number
  platform: 'ig' | 'tt' | 'yt'
}) {
  const colors = {
    ig: 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/30 border-pink-100 dark:border-pink-900/30',
    tt: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30 border-teal-100 dark:border-teal-900/30',
    yt: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900/30'
  }
  if (!value) return <span className="text-gray-300 dark:text-gray-600 text-2xs">-</span>
  return (
    <span
      className={cn(
        'text-2xs font-semibold px-2 py-0.5 rounded-md border',
        colors[platform]
      )}
    >
      {formatCount(value)}
    </span>
  )
}

function CategoryTags({ categories }: { categories: string }) {
  const cats = parseCategories(categories)
  if (!cats.length) return <span className="text-gray-300 dark:text-gray-600 text-2xs">-</span>
  return (
    <div className="flex flex-wrap gap-1">
      {cats.slice(0, 3).map((c) => (
        <span
          key={c}
          className="text-2xs px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 font-medium"
        >
          {c}
        </span>
      ))}
      {cats.length > 3 && (
        <span className="text-2xs text-gray-400 font-medium">+{cats.length - 3}</span>
      )}
    </div>
  )
}

function SkeletonRow() {
  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border-b border-gray-100/50 dark:border-gray-800/30"
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <td key={i} className="px-3 py-2.5">
          <div className="h-3 rounded-md bg-gray-200/60 dark:bg-gray-700/40 animate-pulse" style={{ width: `${40 + Math.random() * 40}%` }} />
        </td>
      ))}
    </motion.tr>
  )
}

export function InfluencerTable({ data, onEdit, isLoading, settings }: InfluencerTableProps) {
  const visibleCols = settings.visible_columns || []
  const density = settings.table_density || 'compact'
  const densityPy = density === 'compact' ? 'py-1.5' : density === 'comfortable' ? 'py-2.5' : 'py-3.5'
  const densityText = density === 'spacious' ? 'text-xs' : 'text-xs'
  const [sorting, setSorting] = useState<SortingState>([])
  const scrape = useScrapeInfluencer()
  const del = useDeleteInfluencer()
  const [scrapingId, setScrapingId] = useState<number | null>(null)

  async function handleScrape(id: number) {
    setScrapingId(id)
    toast.loading('Veri cekiliyor...', { id: `scrape-${id}` })
    try {
      const res = await scrape.mutateAsync(id)
      if (res.errors.length > 0) {
        toast.error(res.errors.join(', '), { id: `scrape-${id}` })
      } else {
        toast.success('Veriler guncellendi', { id: `scrape-${id}` })
      }
    } catch {
      toast.error('Veri cekilemedi', { id: `scrape-${id}` })
    } finally {
      setScrapingId(null)
    }
  }

  function handleDelete(inf: Influencer) {
    if (confirm(`"${inf.name}" silinecek. Emin misiniz?`)) {
      del.mutate(inf.id)
      toast.success(`${inf.name} silindi`)
    }
  }

  const columns = useMemo<ColumnDef<Influencer>[]>(
    () => {
      const allCols: (ColumnDef<Influencer> & { colId?: string })[] = [
      {
        id: 'index',
        header: '#',
        size: 40,
        cell: ({ row }) => (
          <span className="text-gray-400 dark:text-gray-500 text-2xs font-medium tabular-nums">
            {row.index + 1}
          </span>
        )
      },
      {
        accessorKey: 'name',
        colId: 'name',
        header: 'Influencer',
        size: 160,
        cell: ({ getValue }) => (
          <span className="font-semibold text-gray-900 dark:text-gray-100 text-xs tracking-tight">
            {getValue() as string}
          </span>
        )
      },
      {
        accessorKey: 'instagram_followers',
        colId: 'instagram',
        header: 'Instagram',
        size: 95,
        cell: ({ getValue }) => (
          <PlatformBadge value={getValue() as number} platform="ig" />
        )
      },
      {
        accessorKey: 'ig_engagement_rate',
        colId: 'ig_er',
        header: 'ER%',
        size: 60,
        cell: ({ getValue }) => {
          const v = getValue() as number
          if (!v) return <span className="text-gray-300 dark:text-gray-600 text-2xs">-</span>
          return (
            <span
              className={cn(
                'text-2xs font-bold tabular-nums',
                v >= 5
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : v >= 2
                    ? 'text-blue-600 dark:text-blue-400'
                    : v >= 1
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-gray-500'
              )}
            >
              {v}%
            </span>
          )
        }
      },
      {
        accessorKey: 'tiktok_followers',
        colId: 'tiktok',
        header: 'TikTok',
        size: 95,
        cell: ({ getValue }) => (
          <PlatformBadge value={getValue() as number} platform="tt" />
        )
      },
      {
        accessorKey: 'youtube_followers',
        colId: 'youtube',
        header: 'YouTube',
        size: 95,
        cell: ({ getValue }) => (
          <PlatformBadge value={getValue() as number} platform="yt" />
        )
      },
      {
        accessorKey: 'categories',
        colId: 'categories',
        header: 'Kategoriler',
        size: 180,
        enableSorting: false,
        cell: ({ getValue }) => <CategoryTags categories={getValue() as string} />
      },
      {
        accessorKey: 'women_pct',
        colId: 'demographics',
        header: 'W%',
        size: 45,
        cell: ({ getValue }) => {
          const v = getValue() as number
          if (!v) return <span className="text-gray-300 dark:text-gray-600 text-2xs">-</span>
          return <span className="text-2xs font-medium text-gray-600 dark:text-gray-400 tabular-nums">{v}%</span>
        }
      },
      {
        accessorKey: 'men_pct',
        colId: 'demographics_m',
        header: 'M%',
        size: 45,
        cell: ({ getValue }) => {
          const v = getValue() as number
          if (!v) return <span className="text-gray-300 dark:text-gray-600 text-2xs">-</span>
          return <span className="text-2xs font-medium text-gray-600 dark:text-gray-400 tabular-nums">{v}%</span>
        }
      },
      {
        id: 'demographics',
        colId: 'ages',
        header: 'Yas Dagilimlari',
        size: 200,
        enableSorting: false,
        cell: ({ row }) => {
          const d = row.original
          const ages = [d.age_13_17, d.age_18_24, d.age_25_34, d.age_35_44, d.age_45_plus]
          const labels = ['13-17', '18-24', '25-34', '35-44', '45+']
          const anyData = ages.some((a) => a > 0)
          if (!anyData) return <span className="text-gray-300 dark:text-gray-600 text-2xs">-</span>
          const maxVal = Math.max(...ages)
          return (
            <div className="flex gap-0.5 text-2xs">
              {ages.map((a, i) => (
                <div
                  key={i}
                  className={cn(
                    'px-1 py-0.5 rounded text-center min-w-[30px] tabular-nums font-medium',
                    a === maxVal && a > 0
                      ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-bold'
                      : a > 0
                        ? 'bg-gray-100/80 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400'
                        : 'text-gray-300 dark:text-gray-600'
                  )}
                  title={labels[i]}
                >
                  {a || '-'}
                </div>
              ))}
            </div>
          )
        }
      },
      {
        accessorKey: 'tr_pct',
        colId: 'tr_pct',
        header: 'TR%',
        size: 55,
        cell: ({ getValue }) => {
          const v = getValue() as number
          if (!v) return <span className="text-gray-300 dark:text-gray-600 text-2xs">-</span>
          return (
            <span
              className={cn(
                'text-2xs font-bold tabular-nums',
                v >= 70
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : v >= 40
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-gray-500'
              )}
            >
              {v}%
            </span>
          )
        }
      },
      {
        accessorKey: 'kuyd_category',
        colId: 'kuyd',
        header: 'KUYD',
        size: 140,
        cell: ({ getValue }) => {
          const v = getValue() as string
          if (!v) return <span className="text-gray-300 dark:text-gray-600 text-2xs">-</span>
          return (
            <span className="text-2xs px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30 font-medium">
              {v}
            </span>
          )
        }
      },
      {
        accessorKey: 'project',
        colId: 'project',
        header: 'Proje',
        size: 110,
        cell: ({ getValue }) => {
          const v = getValue() as string
          if (!v) return <span className="text-gray-300 dark:text-gray-600 text-2xs">-</span>
          return <span className="text-2xs text-gray-600 dark:text-gray-400 font-medium">{v}</span>
        }
      },
      {
        accessorKey: 'notes',
        colId: 'notes',
        header: 'Not',
        size: 160,
        enableSorting: false,
        cell: ({ getValue }) => {
          const v = getValue() as string
          if (!v) return <span className="text-gray-300 dark:text-gray-600 text-2xs">-</span>
          return (
            <span className="text-2xs text-gray-500 dark:text-gray-400 line-clamp-2" title={v}>
              {v}
            </span>
          )
        }
      },
      {
        id: 'actions',
        header: '',
        size: 90,
        cell: ({ row }) => (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleScrape(row.original.id)}
              disabled={scrapingId === row.original.id}
              className="btn-ghost p-1.5 rounded-lg"
              title="Verileri Guncelle"
            >
              <RefreshCw
                size={13}
                className={scrapingId === row.original.id ? 'animate-spin text-indigo-500' : ''}
              />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onEdit(row.original)}
              className="btn-ghost p-1.5 rounded-lg"
              title="Duzenle"
            >
              <Pencil size={13} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleDelete(row.original)}
              className="btn-ghost p-1.5 rounded-lg text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
              title="Sil"
            >
              <Trash2 size={13} />
            </motion.button>
          </div>
        )
      }
    ]

      return allCols.filter((col) => {
        if (!col.colId) return true
        if (col.colId === 'demographics_m') return visibleCols.includes('demographics')
        return visibleCols.includes(col.colId)
      })
    },
    [scrapingId, visibleCols]
  )

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  })

  if (isLoading) {
    return (
      <div className="flex-1 overflow-hidden px-5 pt-1">
        <div className="rounded-xl border border-white/20 dark:border-white/5 overflow-hidden glass">
          <table className="w-full text-xs">
            <tbody>
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (!data.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex-1 flex flex-col items-center justify-center gap-4"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center"
        >
          <Users size={36} strokeWidth={1.2} className="text-indigo-400" />
        </motion.div>
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
            Henuz influencer eklenmemis
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Ekle butonuna tiklayarak veya Excel import ederek baslayin
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="flex-1 overflow-hidden px-5 pt-1 pb-3">
      <div className="h-full rounded-xl border border-white/30 dark:border-white/5 overflow-hidden glass">
        <div className="h-full overflow-auto">
          <table className="w-full text-xs border-collapse">
            <thead className="sticky top-0 z-10">
              {table.getHeaderGroups().map((hg) => (
                <tr
                  key={hg.id}
                  className="bg-gray-50/90 dark:bg-gray-800/90 backdrop-blur-md"
                >
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      className={cn(
                        'px-3 py-2.5 text-left text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider border-b border-gray-200/50 dark:border-gray-700/50',
                        header.column.getCanSort() &&
                          'cursor-pointer select-none hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors'
                      )}
                      style={{ width: header.getSize() }}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === 'asc' && (
                          <ChevronUp size={10} className="text-indigo-500" />
                        )}
                        {header.column.getIsSorted() === 'desc' && (
                          <ChevronDown size={10} className="text-indigo-500" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              <AnimatePresence>
                {table.getRowModel().rows.map((row, idx) => (
                  <motion.tr
                    key={row.original.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{
                      duration: 0.25,
                      delay: Math.min(idx * 0.02, 0.3),
                      ease: [0.4, 0, 0.2, 1]
                    }}
                    className="group border-b border-gray-100/60 dark:border-gray-800/30 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/10 transition-colors duration-150"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={`px-3 ${densityPy} whitespace-nowrap`}
                        style={{ maxWidth: cell.column.getSize() }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
