import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@iconify/react'
import { useUpdateSettings } from '../hooks/useSettings'
import { useImportExcel } from '../hooks/useInfluencers'
import {
  AGENCY_TYPES, PLATFORM_OPTIONS, DEFAULT_CATEGORIES, ALL_COLUMNS
} from '../types/settings'
import type { AppSettings } from '../types/settings'
import toast from 'react-hot-toast'
import { cn } from '../lib/utils'

interface SetupWizardProps {
  onComplete: () => void
}

interface WizardState {
  agency_name: string
  agency_type: string
  platforms: string[]
  categories: string[]
  newCategory: string
  kuyd_options: string[]
  newKuyd: string
  projects: string[]
  newProject: string
  visible_columns: string[]
  table_density: 'compact' | 'comfortable' | 'spacious'
  theme: 'system' | 'light' | 'dark'
}

const PLATFORM_BRAND_ICONS: Record<string, string> = {
  instagram: 'simple-icons:instagram',
  tiktok: 'simple-icons:tiktok',
  youtube: 'simple-icons:youtube'
}

const STEPS = [
  { id: 'welcome', icon: 'solar:graph-up-linear', title: 'Hosgeldiniz' },
  { id: 'agency', icon: 'solar:buildings-bold-duotone', title: 'Ajans Bilgileri' },
  { id: 'platforms', icon: 'solar:global-bold-duotone', title: 'Platformlar' },
  { id: 'categories', icon: 'solar:tag-bold-duotone', title: 'Kategoriler' },
  { id: 'kuyd', icon: 'solar:tag-bold-duotone', title: 'KUYD & Projeler' },
  { id: 'columns', icon: 'solar:widget-5-bold-duotone', title: 'Tablo Ayarlari' },
  { id: 'theme', icon: 'solar:palette-bold-duotone', title: 'Gorunum' },
  { id: 'data', icon: 'solar:upload-bold-duotone', title: 'Veri Aktarimi' },
  { id: 'done', icon: 'solar:check-circle-bold-duotone', title: 'Tamamlandi' }
]

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 })
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            width: i === current ? 24 : 8,
            backgroundColor: i <= current ? '#6366f1' : i === current ? '#6366f1' : '#e2e8f0'
          }}
          className="h-2 rounded-full"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      ))}
    </div>
  )
}

function TagInput({
  tags,
  onAdd,
  onRemove,
  inputValue,
  onInputChange,
  placeholder
}: {
  tags: string[]
  onAdd: () => void
  onRemove: (t: string) => void
  inputValue: string
  onInputChange: (v: string) => void
  placeholder: string
}) {
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      onAdd()
    }
  }

  return (
    <div>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="input flex-1"
          placeholder={placeholder}
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={onAdd}
          disabled={!inputValue.trim()}
          className="btn-primary btn-sm px-3"
        >
          <Icon icon="solar:add-circle-bold-duotone" width={14} />
        </motion.button>
      </div>
      <div className="flex flex-wrap gap-1.5 max-h-[180px] overflow-y-auto">
        <AnimatePresence>
          {tags.map((tag) => (
            <motion.span
              key={tag}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/30 font-medium"
            >
              {tag}
              <button
                onClick={() => onRemove(tag)}
                className="p-0.5 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
              >
                <Icon icon="solar:close-circle-bold-duotone" width={10} />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

export function SetupWizard({ onComplete }: SetupWizardProps) {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const updateSettings = useUpdateSettings()
  const importExcel = useImportExcel()
  const fileRef = useRef<HTMLInputElement>(null)

  const [state, setState] = useState<WizardState>({
    agency_name: '',
    agency_type: '',
    platforms: ['instagram', 'tiktok', 'youtube'],
    categories: [...DEFAULT_CATEGORIES],
    newCategory: '',
    kuyd_options: ['İş Paola', 'Proje Oluştur', 'İşbirliklerine Odaklan', 'Sabiçöz Kalım'],
    newKuyd: '',
    projects: [],
    newProject: '',
    visible_columns: ALL_COLUMNS.map((c) => c.id),
    table_density: 'compact',
    theme: 'system'
  })

  function set<K extends keyof WizardState>(key: K, value: WizardState[K]) {
    setState((prev) => ({ ...prev, [key]: value }))
  }

  function next() {
    setDirection(1)
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  function prev() {
    setDirection(-1)
    setStep((s) => Math.max(s - 1, 0))
  }

  function togglePlatform(id: string) {
    set('platforms', state.platforms.includes(id)
      ? state.platforms.filter((p) => p !== id)
      : [...state.platforms, id])
  }

  function addCategory() {
    const v = state.newCategory.trim()
    if (v && !state.categories.includes(v)) {
      set('categories', [...state.categories, v])
      set('newCategory', '')
    }
  }

  function removeCategory(c: string) {
    set('categories', state.categories.filter((x) => x !== c))
  }

  function addKuyd() {
    const v = state.newKuyd.trim()
    if (v && !state.kuyd_options.includes(v)) {
      set('kuyd_options', [...state.kuyd_options, v])
      set('newKuyd', '')
    }
  }

  function removeKuyd(k: string) {
    set('kuyd_options', state.kuyd_options.filter((x) => x !== k))
  }

  function addProject() {
    const v = state.newProject.trim()
    if (v && !state.projects.includes(v)) {
      set('projects', [...state.projects, v])
      set('newProject', '')
    }
  }

  function removeProject(p: string) {
    set('projects', state.projects.filter((x) => x !== p))
  }

  function toggleColumn(id: string) {
    const col = ALL_COLUMNS.find((c) => c.id === id)
    if (col && 'required' in col && col.required) return
    set('visible_columns', state.visible_columns.includes(id)
      ? state.visible_columns.filter((c) => c !== id)
      : [...state.visible_columns, id])
  }

  function applyTheme(t: 'system' | 'light' | 'dark') {
    set('theme', t)
    if (t === 'dark') {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else if (t === 'light') {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.classList.toggle('dark', prefersDark)
      localStorage.removeItem('theme')
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const res = await importExcel.mutateAsync(file)
      toast.success(`${res.imported} influencer iceri aktarildi!`)
    } catch {
      toast.error('Import hatasi')
    }
    e.target.value = ''
  }

  async function handleFinish() {
    const payload: Partial<AppSettings> = {
      agency_name: state.agency_name,
      agency_type: state.agency_type,
      platforms: state.platforms,
      categories: state.categories,
      kuyd_options: state.kuyd_options,
      projects: state.projects,
      visible_columns: state.visible_columns,
      table_density: state.table_density,
      theme: state.theme,
      setup_completed: true
    }

    try {
      await updateSettings.mutateAsync(payload)
      toast.success('Kurulum tamamlandi!')
      onComplete()
    } catch {
      toast.error('Ayarlar kaydedilemedi')
    }
  }

  function renderStep() {
    switch (STEPS[step].id) {
      case 'welcome':
        return (
          <div className="text-center py-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="sonar mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-indigo-500/30 mb-6 text-indigo-300"
            >
              <Icon icon="solar:graph-up-linear" width={36} className="text-white" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-3">
              Influencer Tracker
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-md mx-auto">
              Uygulamanizi kisisellestirelim. Ajans bilgilerinizi, takip etmek istediginiz
              platformlari, kategorileri ve gorunum tercihlerinizi ayarlayacagiz.
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
              Bu ayarlari daha sonra istediginiz zaman degistirebilirsiniz.
            </p>
          </div>
        )

      case 'agency':
        return (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Ajans Bilgileri</h3>
              <p className="text-xs text-gray-400 mb-4">Ajansiniz hakkinda temel bilgileri girin.</p>
            </div>
            <div>
              <label className="label">Ajans / Sirket Adi</label>
              <input
                type="text"
                value={state.agency_name}
                onChange={(e) => set('agency_name', e.target.value)}
                className="input"
                placeholder="ornek: Creative Media Agency"
                autoFocus
              />
            </div>
            <div>
              <label className="label">Ajans Turu</label>
              <div className="grid grid-cols-2 gap-2">
                {AGENCY_TYPES.map((type) => (
                  <motion.button
                    key={type}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => set('agency_type', type)}
                    className={cn(
                      'text-xs px-3 py-2.5 rounded-xl border text-left transition-all font-medium',
                      state.agency_type === type
                        ? 'bg-indigo-500 text-white border-indigo-500 shadow-sm shadow-indigo-500/20'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                    )}
                  >
                    {type}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        )

      case 'platforms':
        return (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Platform Secimi</h3>
              <p className="text-xs text-gray-400 mb-4">Hangi platformlardaki influencer'lari takip edeceksiniz?</p>
            </div>
            <div className="space-y-3">
              {PLATFORM_OPTIONS.map((p) => {
                const active = state.platforms.includes(p.id)
                const brandIcon = PLATFORM_BRAND_ICONS[p.id] || 'solar:monitor-bold-duotone'
                return (
                  <motion.button
                    key={p.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="button"
                    onClick={() => togglePlatform(p.id)}
                    className={cn(
                      'w-full flex items-center gap-4 px-5 py-4 rounded-xl border transition-all text-left',
                      active
                        ? 'border-indigo-300 dark:border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-sm'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 opacity-60 hover:opacity-80'
                    )}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${p.color}15` }}
                    >
                      <Icon icon={brandIcon} width={20} style={{ color: p.color }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{p.label}</p>
                      <p className="text-2xs text-gray-400">Takipci sayisi otomatik cekilir</p>
                    </div>
                    <div className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                      active
                        ? 'bg-indigo-500 border-indigo-500'
                        : 'border-gray-300 dark:border-gray-600'
                    )}>
                      {active && <Icon icon="solar:check-read-bold-duotone" width={12} className="text-white" />}
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </div>
        )

      case 'categories':
        return (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Kategori Yonetimi</h3>
              <p className="text-xs text-gray-400 mb-4">
                Influencer'larinizi siniflandirmak icin kullanacaginiz kategorileri belirleyin.
                Varsayilan kategoriler eklenmistir, dilediginizi ekleyip cikarabilirsiniz.
              </p>
            </div>
            <TagInput
              tags={state.categories}
              onAdd={addCategory}
              onRemove={removeCategory}
              inputValue={state.newCategory}
              onInputChange={(v) => set('newCategory', v)}
              placeholder="Yeni kategori ekle..."
            />
          </div>
        )

      case 'kuyd':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">KUYD & Proje Yonetimi</h3>
              <p className="text-xs text-gray-400 mb-4">
                KUYD kategorilerinizi ve proje isimlerinizi onceden tanimlayabilirsiniz.
              </p>
            </div>
            <div>
              <label className="label">KUYD Kategorileri</label>
              <TagInput
                tags={state.kuyd_options}
                onAdd={addKuyd}
                onRemove={removeKuyd}
                inputValue={state.newKuyd}
                onInputChange={(v) => set('newKuyd', v)}
                placeholder="Yeni KUYD kategorisi..."
              />
            </div>
            <div>
              <label className="label">Proje Isimleri</label>
              <TagInput
                tags={state.projects}
                onAdd={addProject}
                onRemove={removeProject}
                inputValue={state.newProject}
                onInputChange={(v) => set('newProject', v)}
                placeholder="Yeni proje adi..."
              />
              <p className="text-2xs text-gray-400 mt-2">
                Projeler sonradan da eklenebilir, bu alan opsiyoneldir.
              </p>
            </div>
          </div>
        )

      case 'columns':
        return (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Tablo Ayarlari</h3>
              <p className="text-xs text-gray-400 mb-4">
                Tabloda hangi kolonlarin gorunmesini istediginizi secin ve tablo yogunlugunu belirleyin.
              </p>
            </div>
            <div>
              <label className="label mb-2">Gorunur Kolonlar</label>
              <div className="space-y-1.5 max-h-[220px] overflow-y-auto">
                {ALL_COLUMNS.map((col) => {
                  const isRequired = 'required' in col && col.required
                  const active = state.visible_columns.includes(col.id)
                  return (
                    <motion.button
                      key={col.id}
                      whileHover={{ scale: 1.005 }}
                      whileTap={{ scale: 0.995 }}
                      type="button"
                      onClick={() => toggleColumn(col.id)}
                      disabled={isRequired}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 rounded-lg border text-left text-xs transition-all',
                        active
                          ? 'border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 opacity-50',
                        isRequired && 'cursor-not-allowed'
                      )}
                    >
                      <div className={cn(
                        'w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0',
                        active
                          ? 'bg-indigo-500 border-indigo-500'
                          : 'border-gray-300 dark:border-gray-600'
                      )}>
                        {active && <Icon icon="solar:check-read-bold-duotone" width={10} className="text-white" />}
                      </div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">{col.label}</span>
                      {isRequired && (
                        <span className="text-2xs text-gray-400 ml-auto">Zorunlu</span>
                      )}
                    </motion.button>
                  )
                })}
              </div>
            </div>
            <div>
              <label className="label mb-2">Tablo Yogunlugu</label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { id: 'compact', label: 'Kompakt', desc: 'Daha fazla veri' },
                  { id: 'comfortable', label: 'Normal', desc: 'Dengeli' },
                  { id: 'spacious', label: 'Genis', desc: 'Rahat okuma' }
                ] as const).map((d) => (
                  <motion.button
                    key={d.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => set('table_density', d.id)}
                    className={cn(
                      'text-center px-3 py-3 rounded-xl border transition-all',
                      state.table_density === d.id
                        ? 'border-indigo-300 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-950/20 shadow-sm'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                    )}
                  >
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">{d.label}</p>
                    <p className="text-2xs text-gray-400 mt-0.5">{d.desc}</p>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        )

      case 'theme':
        return (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Gorunum Tercihi</h3>
              <p className="text-xs text-gray-400 mb-4">Uygulama temasini secin.</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {([
                { id: 'system', label: 'Sistem', desc: 'Isletim sistemini takip et', icon: 'solar:monitor-bold-duotone' },
                { id: 'light', label: 'Acik Tema', desc: 'Her zaman acik mod', icon: 'solar:sun-bold-duotone' },
                { id: 'dark', label: 'Koyu Tema', desc: 'Her zaman koyu mod', icon: 'solar:moon-bold-duotone' }
              ] as const).map((t) => (
                <motion.button
                  key={t.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => applyTheme(t.id)}
                  className={cn(
                    'flex flex-col items-center gap-3 px-4 py-5 rounded-xl border transition-all',
                    state.theme === t.id
                      ? 'border-indigo-300 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-950/20 shadow-sm'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                  )}
                >
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center',
                    state.theme === t.id
                      ? 'bg-indigo-100 dark:bg-indigo-900/40'
                      : 'bg-gray-100 dark:bg-gray-700'
                  )}>
                    <Icon icon={t.icon} width={22} className={state.theme === t.id ? 'text-indigo-500' : 'text-gray-400'} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">{t.label}</p>
                    <p className="text-2xs text-gray-400 mt-0.5">{t.desc}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )

      case 'data':
        return (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Veri Aktarimi</h3>
              <p className="text-xs text-gray-400 mb-4">
                Mevcut influencer verilerinizi Excel dosyasindan iceri aktarabilirsiniz.
                Bu adimi atlamak isterseniz sonradan da import yapabilirsiniz.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full flex flex-col items-center gap-3 px-6 py-8 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 bg-gray-50/50 dark:bg-gray-800/50 transition-all"
            >
              <div className="w-14 h-14 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                <Icon icon="solar:upload-bold-duotone" width={24} className="text-indigo-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Excel Dosyasi Yukle
                </p>
                <p className="text-2xs text-gray-400 mt-1">.xlsx veya .xls formatinda</p>
              </div>
            </motion.button>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleImport}
            />
            <p className="text-center text-2xs text-gray-400">
              Bu adimi atlayarak sonradan da veri aktarabilirsiniz.
            </p>
          </div>
        )

      case 'done':
        return (
          <div className="text-center py-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-500/30 mb-6"
            >
              <Icon icon="solar:check-circle-bold-duotone" width={36} className="text-white" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-3">
              Her Sey Hazir!
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-md mx-auto mb-2">
              {state.agency_name
                ? `${state.agency_name} icin uygulamaniz kullanima hazir.`
                : 'Uygulamaniz kullanima hazir.'}
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {state.platforms.map((p) => {
                const opt = PLATFORM_OPTIONS.find((o) => o.id === p)
                return opt ? (
                  <span
                    key={p}
                    className="text-2xs px-2.5 py-1 rounded-lg font-medium"
                    style={{ backgroundColor: `${opt.color}15`, color: opt.color }}
                  >
                    {opt.label}
                  </span>
                ) : null
              })}
              <span className="text-2xs px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 font-medium">
                {state.categories.length} kategori
              </span>
              <span className="text-2xs px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 font-medium">
                {state.visible_columns.length} kolon
              </span>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const isLast = step === STEPS.length - 1

  return (
    <div className="h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/40 border border-white/20 dark:border-gray-700/50 overflow-hidden"
      >
        <div className="px-8 pt-6 pb-4 flex items-center justify-between">
          <StepIndicator current={step} total={STEPS.length} />
          <span className="text-2xs text-gray-400 font-medium tabular-nums">
            {step + 1} / {STEPS.length}
          </span>
        </div>

        <div className="px-8 min-h-[380px] flex flex-col justify-center">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="px-8 py-5 flex items-center justify-between border-t border-gray-100 dark:border-gray-800">
          <motion.button
            whileHover={{ scale: step > 0 ? 1.02 : 1 }}
            whileTap={{ scale: step > 0 ? 0.96 : 1 }}
            onClick={prev}
            disabled={step === 0}
            className={cn(
              'btn-secondary btn-sm flex items-center gap-1.5',
              step === 0 && 'opacity-0 pointer-events-none'
            )}
          >
            <Icon icon="solar:alt-arrow-left-bold-duotone" width={14} />
            Geri
          </motion.button>

          {isLast ? (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleFinish}
              disabled={updateSettings.isPending}
              className="btn-primary btn-sm flex items-center gap-1.5 px-5"
            >
              {updateSettings.isPending ? 'Kaydediliyor...' : 'Basla'}
              <Icon icon="solar:arrow-right-bold-duotone" width={14} />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={next}
              className="btn-primary btn-sm flex items-center gap-1.5"
            >
              Devam
              <Icon icon="solar:alt-arrow-right-bold-duotone" width={14} />
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  )
}
