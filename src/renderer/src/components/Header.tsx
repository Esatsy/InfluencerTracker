import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Download,
  Upload,
  RefreshCw,
  Plus,
  Moon,
  Sun,
  Sparkles
} from 'lucide-react'
import { api } from '../lib/api'
import { useScrapeAll, useImportExcel } from '../hooks/useInfluencers'
import toast from 'react-hot-toast'

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
    toast.loading('Veriler guncelleniyor...', { id: 'scrape' })
    try {
      const res = await scrapeAll.mutateAsync()
      const errCount = res.results.filter((r) => r.errors.length > 0).length
      if (errCount > 0) {
        toast.error(`${res.results.length - errCount} basarili, ${errCount} hatali`, { id: 'scrape' })
      } else {
        toast.success(`${res.results.length} influencer guncellendi`, { id: 'scrape' })
      }
    } catch {
      toast.error('Guncelleme sirasinda hata olustu', { id: 'scrape' })
    } finally {
      setScraping(false)
    }
  }

  async function handleExport() {
    try {
      await api.exportExcel()
      toast.success('Excel dosyasi indirildi')
    } catch {
      toast.error('Export sirasinda hata olustu')
    }
  }

  function handleImportClick() {
    fileRef.current?.click()
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const res = await importExcel.mutateAsync(file)
      toast.success(`${res.imported} influencer iceri aktarildi`)
    } catch {
      toast.error('Import sirasinda hata olustu')
    }
    e.target.value = ''
  }

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="glass border-b border-white/20 dark:border-white/5 px-5 py-3 relative z-20"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20"
          >
            <Sparkles size={18} className="text-white" />
          </motion.div>
          <div>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white leading-none tracking-tight">
              Influencer Tracker
            </h1>
            <motion.span
              key={influencerCount}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[11px] text-gray-400 dark:text-gray-500 font-medium"
            >
              {influencerCount} influencer
            </motion.span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={onAddClick}
            className="btn-primary btn-sm"
            title="Yeni Ekle"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Ekle</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleScrapeAll}
            disabled={scraping}
            className="btn-secondary btn-sm"
            title="Tum Verileri Guncelle"
          >
            <RefreshCw size={14} className={scraping ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">
              {scraping ? 'Guncelleniyor...' : 'Guncelle'}
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleExport}
            className="btn-secondary btn-sm"
            title="Excel Export"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Export</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleImportClick}
            className="btn-secondary btn-sm"
            title="Excel Import"
          >
            <Upload size={14} />
            <span className="hidden sm:inline">Import</span>
          </motion.button>

          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleImportFile}
          />

          <div className="w-px h-5 bg-gray-200/60 dark:bg-gray-700/40 mx-1" />

          <motion.button
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="btn-ghost btn-sm p-1.5"
            title="Tema Degistir"
          >
            <AnimatePresence mode="wait">
              {dark ? (
                <motion.div
                  key="sun"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Sun size={15} />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Moon size={15} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.header>
  )
}
