import { useMemo, useState } from 'react'
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
  Users,
  ChevronDown
} from 'lucide-react'
import type { Influencer } from '../types/influencer'
import { formatCount, parseCategories, cn } from '../lib/utils'
import { useScrapeInfluencer, useDeleteInfluencer } from '../hooks/useInfluencers'

interface InfluencerTableProps {
  data: Influencer[]
  onEdit: (inf: Influencer) => void
  isLoading: boolean
}

function PlatformBadge({
  value,
  platform
}: {
  value: number
  platform: 'ig' | 'tt' | 'yt'
}) {
  const colors = {
    ig: 'text-pink-600 bg-pink-50 dark:bg-pink-950/30',
    tt: 'text-teal-600 bg-teal-50 dark:bg-teal-950/30',
    yt: 'text-red-600 bg-red-50 dark:bg-red-950/30'
  }
  if (!value) return <span className="text-gray-300 text-2xs">-</span>
  return (
    <span className={cn('text-2xs font-semibold px-1.5 py-0.5 rounded', colors[platform])}>
      {formatCount(value)}
    </span>
  )
}

function CategoryTags({ categories }: { categories: string }) {
  const cats = parseCategories(categories)
  if (!cats.length) return <span className="text-gray-300 text-2xs">-</span>
  return (
    <div className="flex flex-wrap gap-0.5">
      {cats.slice(0, 3).map((c) => (
        <span
          key={c}
          className="text-2xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
        >
          {c}
        </span>
      ))}
      {cats.length > 3 && (
        <span className="text-2xs text-gray-400">+{cats.length - 3}</span>
      )}
    </div>
  )
}

function DemoPill({ value }: { value: number }) {
  if (!value) return <span className="text-gray-300">-</span>
  return <span>{value}%</span>
}

export function InfluencerTable({ data, onEdit, isLoading }: InfluencerTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const scrape = useScrapeInfluencer()
  const del = useDeleteInfluencer()
  const [scrapingId, setScrapingId] = useState<number | null>(null)

  async function handleScrape(id: number) {
    setScrapingId(id)
    try {
      await scrape.mutateAsync(id)
    } finally {
      setScrapingId(null)
    }
  }

  function handleDelete(inf: Influencer) {
    if (confirm(`"${inf.name}" silinecek. Emin misiniz?`)) {
      del.mutate(inf.id)
    }
  }

  const columns = useMemo<ColumnDef<Influencer>[]>(
    () => [
      {
        id: 'index',
        header: '#',
        size: 40,
        cell: ({ row }) => (
          <span className="text-gray-400 text-2xs">{row.index + 1}</span>
        )
      },
      {
        accessorKey: 'name',
        header: 'Influencer',
        size: 160,
        cell: ({ getValue }) => (
          <span className="font-medium text-gray-900 dark:text-gray-100 text-xs">
            {getValue() as string}
          </span>
        )
      },
      {
        accessorKey: 'instagram_followers',
        header: 'Instagram',
        size: 90,
        cell: ({ getValue }) => (
          <PlatformBadge value={getValue() as number} platform="ig" />
        )
      },
      {
        accessorKey: 'ig_engagement_rate',
        header: 'ER%',
        size: 60,
        cell: ({ getValue }) => {
          const v = getValue() as number
          if (!v) return <span className="text-gray-300 text-2xs">-</span>
          return (
            <span
              className={cn(
                'text-2xs font-semibold',
                v >= 5
                  ? 'text-green-600'
                  : v >= 2
                    ? 'text-blue-600'
                    : v >= 1
                      ? 'text-yellow-600'
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
        header: 'TikTok',
        size: 90,
        cell: ({ getValue }) => (
          <PlatformBadge value={getValue() as number} platform="tt" />
        )
      },
      {
        accessorKey: 'youtube_followers',
        header: 'YouTube',
        size: 90,
        cell: ({ getValue }) => (
          <PlatformBadge value={getValue() as number} platform="yt" />
        )
      },
      {
        accessorKey: 'categories',
        header: 'Kategoriler',
        size: 180,
        enableSorting: false,
        cell: ({ getValue }) => <CategoryTags categories={getValue() as string} />
      },
      {
        accessorKey: 'women_pct',
        header: 'W%',
        size: 50,
        cell: ({ getValue }) => <DemoPill value={getValue() as number} />
      },
      {
        accessorKey: 'men_pct',
        header: 'M%',
        size: 50,
        cell: ({ getValue }) => <DemoPill value={getValue() as number} />
      },
      {
        id: 'demographics',
        header: '13-17 / 18-24 / 25-34 / 35-44 / 45+',
        size: 200,
        enableSorting: false,
        cell: ({ row }) => {
          const d = row.original
          const ages = [d.age_13_17, d.age_18_24, d.age_25_34, d.age_35_44, d.age_45_plus]
          const anyData = ages.some((a) => a > 0)
          if (!anyData) return <span className="text-gray-300 text-2xs">-</span>
          return (
            <div className="flex gap-1 text-2xs">
              {ages.map((a, i) => (
                <span
                  key={i}
                  className={cn(
                    'px-1 py-0.5 rounded text-center min-w-[28px]',
                    a > 30
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold'
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-500'
                  )}
                >
                  {a || '-'}
                </span>
              ))}
            </div>
          )
        }
      },
      {
        accessorKey: 'tr_pct',
        header: 'TR%',
        size: 55,
        cell: ({ getValue }) => {
          const v = getValue() as number
          if (!v) return <span className="text-gray-300 text-2xs">-</span>
          return (
            <span
              className={cn(
                'text-2xs font-semibold',
                v >= 70
                  ? 'text-green-600'
                  : v >= 40
                    ? 'text-yellow-600'
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
        header: 'KUYD',
        size: 140,
        cell: ({ getValue }) => {
          const v = getValue() as string
          if (!v) return <span className="text-gray-300 text-2xs">-</span>
          return (
            <span className="text-2xs px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400">
              {v}
            </span>
          )
        }
      },
      {
        accessorKey: 'project',
        header: 'Proje',
        size: 110,
        cell: ({ getValue }) => {
          const v = getValue() as string
          if (!v) return <span className="text-gray-300 text-2xs">-</span>
          return <span className="text-2xs text-gray-600 dark:text-gray-400">{v}</span>
        }
      },
      {
        accessorKey: 'notes',
        header: 'Not',
        size: 160,
        enableSorting: false,
        cell: ({ getValue }) => {
          const v = getValue() as string
          if (!v) return <span className="text-gray-300 text-2xs">-</span>
          return (
            <span className="text-2xs text-gray-500 line-clamp-2" title={v}>
              {v}
            </span>
          )
        }
      },
      {
        id: 'actions',
        header: '',
        size: 80,
        cell: ({ row }) => (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => handleScrape(row.original.id)}
              disabled={scrapingId === row.original.id}
              className="btn-ghost btn-sm p-1"
              title="Verileri Guncelle"
            >
              <RefreshCw
                size={12}
                className={scrapingId === row.original.id ? 'animate-spin' : ''}
              />
            </button>
            <button
              onClick={() => onEdit(row.original)}
              className="btn-ghost btn-sm p-1"
              title="Duzenle"
            >
              <Pencil size={12} />
            </button>
            <button
              onClick={() => handleDelete(row.original)}
              className="btn-ghost btn-sm p-1 text-red-500 hover:text-red-600"
              title="Sil"
            >
              <Trash2 size={12} />
            </button>
          </div>
        )
      }
    ],
    [scrapingId]
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
      <div className="flex-1 flex items-center justify-center">
        <RefreshCw size={24} className="animate-spin text-gray-400" />
      </div>
    )
  }

  if (!data.length) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-2">
        <Users size={48} strokeWidth={1} />
        <p className="text-sm">Henuz influencer eklenmemis</p>
        <p className="text-xs">Ekle butonuna tiklayarak baslayin</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full text-xs border-collapse">
        <thead className="sticky top-0 z-10">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id} className="bg-gray-100 dark:bg-gray-800/80 backdrop-blur">
              {hg.headers.map((header) => (
                <th
                  key={header.id}
                  className={cn(
                    'px-2 py-2 text-left text-2xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b',
                    header.column.getCanSort() && 'cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200'
                  )}
                  style={{ width: header.getSize() }}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <div className="flex items-center gap-1">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getIsSorted() === 'asc' && <ChevronUp size={10} />}
                    {header.column.getIsSorted() === 'desc' && <ChevronDown size={10} />}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="group border-b border-gray-100 dark:border-gray-800/50 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors"
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="px-2 py-1.5 whitespace-nowrap"
                  style={{ maxWidth: cell.column.getSize() }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
