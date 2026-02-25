import { useRef } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Plus, Upload, ArrowRight } from 'lucide-react'
import { useImportExcel } from '../hooks/useInfluencers'
import toast from 'react-hot-toast'

interface WelcomeProps {
  onAddClick: () => void
}

export function Welcome({ onAddClick }: WelcomeProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const importExcel = useImportExcel()

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const res = await importExcel.mutateAsync(file)
      toast.success(`${res.imported} influencer basariyla iceri aktarildi!`)
    } catch {
      toast.error('Import sirasinda hata olustu')
    }
    e.target.value = ''
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="max-w-lg w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
          className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-indigo-500/30 mb-6"
        >
          <Sparkles size={36} className="text-white" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-2"
        >
          Influencer Tracker'a Hosgeldiniz
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
          className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed"
        >
          Instagram, TikTok ve YouTube influencer'larinizi tek bir yerden takip edin.
          <br />
          Baslamak icin bir influencer ekleyin veya mevcut Excel dosyanizi iceri aktarin.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={onAddClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-shadow"
          >
            <Plus size={18} />
            Influencer Ekle
            <ArrowRight size={16} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => fileRef.current?.click()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-sm border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
          >
            <Upload size={18} />
            Excel Import
          </motion.button>
        </motion.div>

        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleImport}
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-10 flex items-center justify-center gap-6"
        >
          {[
            { label: 'Otomatik Veri Cekme', desc: 'Takipci sayilarini otomatik guncelleyin' },
            { label: 'Excel Uyumluluk', desc: 'Verileri Excel ile iceri/disari aktarin' },
            { label: 'Lokal & Guvenli', desc: 'Tum veriler bilgisayarinizda kalir' }
          ].map((feature, i) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + i * 0.1, duration: 0.3 }}
              className="text-center"
            >
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                {feature.label}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}
