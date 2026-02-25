import { useState, useRef, useEffect } from 'react'
import {
  Download,
  Upload,
  RefreshCw,
  Plus,
  Moon,
  Sun,
  Users
} from 'lucide-react'
import { api } from '../lib/api'
import { useScrapeAll, useImportExcel } from '../hooks/useInfluencers'

interface HeaderProps {
  onAddClick: () => void
  influencerCount: number
}

export function Header({ onAddClick, influencerCount }: HeaderProps) {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('theme')
    if (saved) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  const [scraping, setScraping] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])
  const fileRef = useRef<HTMLInputElement>(null)
  const scrapeAll = useScrapeAll()
  const importExcel = useImportExcel()

  function toggleTheme() {
    setDark((prev) => !prev)
  }

  async function handleScrapeAll() {
    setScraping(true)
    try {
      await scrapeAll.mutateAsync()
    } finally {
      setScraping(false)
    }
  }

  async function handleExport() {
    await api.exportExcel()
  }

  function handleImportClick() {
    fileRef.current?.click()
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    await importExcel.mutateAsync(file)
    e.target.value = ''
  }

  return (
    <header className="border-b bg-white dark:bg-gray-900 px-4 py-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Users size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900 dark:text-white leading-none">
                Influencer Tracker
              </h1>
              <span className="text-2xs text-gray-500">
                {influencerCount} influencer
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button onClick={onAddClick} className="btn-primary btn-sm" title="Yeni Ekle">
            <Plus size={14} />
            <span className="hidden sm:inline">Ekle</span>
          </button>

          <button
            onClick={handleScrapeAll}
            disabled={scraping}
            className="btn-secondary btn-sm"
            title="Tum Verileri Guncelle"
          >
            <RefreshCw size={14} className={scraping ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">
              {scraping ? 'Guncelleniyor...' : 'Guncelle'}
            </span>
          </button>

          <button onClick={handleExport} className="btn-secondary btn-sm" title="Excel Export">
            <Download size={14} />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button onClick={handleImportClick} className="btn-secondary btn-sm" title="Excel Import">
            <Upload size={14} />
            <span className="hidden sm:inline">Import</span>
          </button>

          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleImportFile}
          />

          <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />

          <button onClick={toggleTheme} className="btn-ghost btn-sm" title="Tema Degistir">
            {dark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </div>
    </header>
  )
}
