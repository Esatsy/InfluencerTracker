import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@iconify/react'
import type { Influencer } from '../types/influencer'
import type { AppSettings } from '../types/settings'
import { parseCategories } from '../lib/utils'
import { useCreateInfluencer, useUpdateInfluencer } from '../hooks/useInfluencers'
import { useMouseGlow } from '../hooks/useMouseGlow'
import toast from 'react-hot-toast'

interface InfluencerFormProps {
  influencer: Influencer | null
  open: boolean
  onClose: () => void
  settings: AppSettings
}

const defaultForm = {
  name: '',
  instagram_username: '',
  instagram_followers: 0,
  tiktok_username: '',
  tiktok_followers: 0,
  youtube_username: '',
  youtube_followers: 0,
  categories: [] as string[],
  women_pct: 0,
  men_pct: 0,
  age_13_17: 0,
  age_18_24: 0,
  age_25_34: 0,
  age_35_44: 0,
  age_45_plus: 0,
  tr_pct: 0,
  kuyd_category: '',
  project: '',
  notes: ''
}

type FormData = typeof defaultForm

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
}

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 400, damping: 30 }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.15 }
  }
}

export function InfluencerForm({ influencer, open, onClose, settings }: InfluencerFormProps) {
  const [form, setForm] = useState<FormData>(defaultForm)
  const create = useCreateInfluencer()
  const update = useUpdateInfluencer()
  const isEdit = !!influencer
  const glow = useMouseGlow()

  useEffect(() => {
    if (influencer) {
      setForm({
        name: influencer.name,
        instagram_username: influencer.instagram_username,
        instagram_followers: influencer.instagram_followers,
        tiktok_username: influencer.tiktok_username,
        tiktok_followers: influencer.tiktok_followers,
        youtube_username: influencer.youtube_username,
        youtube_followers: influencer.youtube_followers,
        categories: parseCategories(influencer.categories),
        women_pct: influencer.women_pct,
        men_pct: influencer.men_pct,
        age_13_17: influencer.age_13_17,
        age_18_24: influencer.age_18_24,
        age_25_34: influencer.age_25_34,
        age_35_44: influencer.age_35_44,
        age_45_plus: influencer.age_45_plus,
        tr_pct: influencer.tr_pct,
        kuyd_category: influencer.kuyd_category,
        project: influencer.project,
        notes: influencer.notes
      })
    } else {
      setForm(defaultForm)
    }
  }, [influencer, open])

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function toggleCategory(cat: string) {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat]
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return

    const payload = {
      ...form,
      categories: JSON.stringify(form.categories)
    }

    try {
      if (isEdit && influencer) {
        await update.mutateAsync({ id: influencer.id, data: payload })
        toast.success(`${form.name} guncellendi`)
      } else {
        await create.mutateAsync(payload)
        toast.success(`${form.name} eklendi`)
      }
      onClose()
    } catch {
      toast.error('Islem sirasinda hata olustu')
    }
  }

  const saving = create.isPending || update.isPending

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-10 bg-black/30 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            {...glow}
            className="flashlight flashlight-border bg-white dark:bg-gray-900 rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/40 border border-white/20 dark:border-gray-700/50 w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
                  {isEdit ? 'Influencer Duzenle' : 'Yeni Influencer Ekle'}
                </h2>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {isEdit ? 'Bilgileri guncelleyin' : 'Influencer bilgilerini girin'}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Icon icon="solar:close-circle-bold-duotone" width={18} className="text-gray-400" />
              </motion.button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div>
                <label className="label">Influencer Adi *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  className="input"
                  placeholder="Adi Soyadi"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="label flex items-center gap-1.5">
                  Sosyal Medya Hesaplari
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div className="relative">
                    <Icon icon="simple-icons:instagram" width={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-400" />
                    <input
                      type="text"
                      value={form.instagram_username}
                      onChange={(e) => set('instagram_username', e.target.value)}
                      className="input pl-9"
                      placeholder="instagram"
                    />
                  </div>
                  <div className="relative">
                    <Icon icon="simple-icons:tiktok" width={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-400" />
                    <input
                      type="text"
                      value={form.tiktok_username}
                      onChange={(e) => set('tiktok_username', e.target.value)}
                      className="input pl-9"
                      placeholder="tiktok"
                    />
                  </div>
                  <div className="relative">
                    <Icon icon="simple-icons:youtube" width={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400" />
                    <input
                      type="text"
                      value={form.youtube_username}
                      onChange={(e) => set('youtube_username', e.target.value)}
                      className="input pl-9"
                      placeholder="youtube"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="label">Takipci Sayilari (Manuel)</label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <span className="text-2xs text-gray-400 mb-1 block">IG Takipci</span>
                    <input
                      type="number"
                      value={form.instagram_followers || ''}
                      onChange={(e) => set('instagram_followers', Number(e.target.value))}
                      className="input py-1.5 text-xs"
                      placeholder="0"
                      min={0}
                    />
                  </div>
                  <div>
                    <span className="text-2xs text-gray-400 mb-1 block">TT Takipci</span>
                    <input
                      type="number"
                      value={form.tiktok_followers || ''}
                      onChange={(e) => set('tiktok_followers', Number(e.target.value))}
                      className="input py-1.5 text-xs"
                      placeholder="0"
                      min={0}
                    />
                  </div>
                  <div>
                    <span className="text-2xs text-gray-400 mb-1 block">YT Abone</span>
                    <input
                      type="number"
                      value={form.youtube_followers || ''}
                      onChange={(e) => set('youtube_followers', Number(e.target.value))}
                      className="input py-1.5 text-xs"
                      placeholder="0"
                      min={0}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="label">Kategoriler</label>
                <div className="flex flex-wrap gap-1.5">
                  {settings.categories.map((cat) => (
                    <motion.button
                      key={cat}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleCategory(cat)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-200 font-medium ${
                        form.categories.includes(cat)
                          ? 'bg-indigo-500 text-white border-indigo-500 shadow-sm shadow-indigo-500/20'
                          : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
                      }`}
                    >
                      {cat}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Demografik Veriler (%)</label>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <span className="text-2xs text-gray-400 mb-1 block">Kadin</span>
                    <input
                      type="number"
                      value={form.women_pct || ''}
                      onChange={(e) => set('women_pct', Number(e.target.value))}
                      className="input py-1.5 text-xs"
                      min={0}
                      max={100}
                    />
                  </div>
                  <div>
                    <span className="text-2xs text-gray-400 mb-1 block">Erkek</span>
                    <input
                      type="number"
                      value={form.men_pct || ''}
                      onChange={(e) => set('men_pct', Number(e.target.value))}
                      className="input py-1.5 text-xs"
                      min={0}
                      max={100}
                    />
                  </div>
                  <div>
                    <span className="text-2xs text-gray-400 mb-1 block">TR</span>
                    <input
                      type="number"
                      value={form.tr_pct || ''}
                      onChange={(e) => set('tr_pct', Number(e.target.value))}
                      className="input py-1.5 text-xs"
                      min={0}
                      max={100}
                    />
                  </div>
                  <div />
                </div>
              </div>

              <div>
                <label className="label">Yas Gruplari (%)</label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { key: 'age_13_17' as const, label: '13-17' },
                    { key: 'age_18_24' as const, label: '18-24' },
                    { key: 'age_25_34' as const, label: '25-34' },
                    { key: 'age_35_44' as const, label: '35-44' },
                    { key: 'age_45_plus' as const, label: '45+' }
                  ].map((ag) => (
                    <div key={ag.key}>
                      <span className="text-2xs text-gray-400 mb-1 block">{ag.label}</span>
                      <input
                        type="number"
                        value={form[ag.key] || ''}
                        onChange={(e) => set(ag.key, Number(e.target.value))}
                        className="input py-1.5 text-xs"
                        min={0}
                        max={100}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">KUYD Kategori</label>
                  <select
                    value={form.kuyd_category}
                    onChange={(e) => set('kuyd_category', e.target.value)}
                    className="input"
                  >
                    <option value="">Sec...</option>
                    {settings.kuyd_options.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Proje</label>
                  {settings.projects && settings.projects.length > 0 ? (
                    <select
                      value={form.project}
                      onChange={(e) => set('project', e.target.value)}
                      className="input"
                    >
                      <option value="">Sec...</option>
                      {settings.projects.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={form.project}
                      onChange={(e) => set('project', e.target.value)}
                      className="input"
                      placeholder="Proje adi"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="label">Notlar</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => set('notes', e.target.value)}
                  className="input min-h-[60px] resize-y"
                  placeholder="Ek notlar..."
                  rows={2}
                />
              </div>
            </form>

            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={onClose}
                className="btn-secondary btn-sm"
              >
                Iptal
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleSubmit as () => void}
                disabled={saving || !form.name.trim()}
                className="btn-primary btn-sm"
              >
                {saving ? 'Kaydediliyor...' : isEdit ? 'Guncelle' : 'Ekle'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
