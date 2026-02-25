import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Building2, Tags, Columns3, Palette, Plus, Check,
  Sun, Moon, Monitor, RotateCcw
} from 'lucide-react'
import { useSettings, useUpdateSettings } from '../hooks/useSettings'
import { ALL_COLUMNS, DEFAULT_CATEGORIES, AGENCY_TYPES } from '../types/settings'
import type { AppSettings } from '../types/settings'
import { cn } from '../lib/utils'
import toast from 'react-hot-toast'

interface SettingsPanelProps {
  open: boolean
  onClose: () => void
}

type Tab = 'agency' | 'categories' | 'columns' | 'theme'

const TABS: { id: Tab; label: string; icon: typeof Building2 }[] = [
  { id: 'agency', label: 'Ajans', icon: Building2 },
  { id: 'categories', label: 'Kategoriler', icon: Tags },
  { id: 'columns', label: 'Tablo', icon: Columns3 },
  { id: 'theme', label: 'Gorunum', icon: Palette }
]

export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const { data: settings } = useSettings()
  const updateSettings = useUpdateSettings()
  const [tab, setTab] = useState<Tab>('agency')
  const [local, setLocal] = useState<Partial<AppSettings>>({})
  const [newCat, setNewCat] = useState('')
  const [newKuyd, setNewKuyd] = useState('')
  const [newProject, setNewProject] = useState('')

  useEffect(() => {
    if (settings) setLocal({ ...settings })
  }, [settings, open])

  function update<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    setLocal((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    try {
      await updateSettings.mutateAsync(local)
      if (local.theme === 'dark') {
        document.documentElement.classList.add('dark')
        localStorage.setItem('theme', 'dark')
      } else if (local.theme === 'light') {
        document.documentElement.classList.remove('dark')
        localStorage.setItem('theme', 'light')
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        document.documentElement.classList.toggle('dark', prefersDark)
        localStorage.removeItem('theme')
      }
      toast.success('Ayarlar kaydedildi')
      onClose()
    } catch {
      toast.error('Ayarlar kaydedilemedi')
    }
  }

  function addTag(
    listKey: 'categories' | 'kuyd_options' | 'projects',
    value: string,
    clearFn: () => void
  ) {
    const v = value.trim()
    const list = (local[listKey] as string[]) || []
    if (v && !list.includes(v)) {
      update(listKey, [...list, v])
      clearFn()
    }
  }

  function removeTag(listKey: 'categories' | 'kuyd_options' | 'projects', value: string) {
    const list = (local[listKey] as string[]) || []
    update(listKey, list.filter((x) => x !== value))
  }

  function toggleColumn(id: string) {
    const col = ALL_COLUMNS.find((c) => c.id === id)
    if (col && 'required' in col && col.required) return
    const cols = local.visible_columns || []
    update('visible_columns', cols.includes(id) ? cols.filter((c) => c !== id) : [...cols, id])
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-8 bg-black/30 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50 w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Ayarlar</h2>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X size={18} className="text-gray-400" />
              </motion.button>
            </div>

            <div className="flex border-b border-gray-100 dark:border-gray-800 px-6">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-all -mb-px',
                    tab === t.id
                      ? 'text-indigo-600 dark:text-indigo-400 border-indigo-500'
                      : 'text-gray-400 border-transparent hover:text-gray-600 dark:hover:text-gray-300'
                  )}
                >
                  <t.icon size={14} />
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {tab === 'agency' && (
                <div className="space-y-5">
                  <div>
                    <label className="label">Ajans / Sirket Adi</label>
                    <input
                      type="text"
                      value={local.agency_name || ''}
                      onChange={(e) => update('agency_name', e.target.value)}
                      className="input"
                      placeholder="Ajans adiniz"
                    />
                  </div>
                  <div>
                    <label className="label">Ajans Turu</label>
                    <div className="grid grid-cols-2 gap-2">
                      {AGENCY_TYPES.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => update('agency_type', type)}
                          className={cn(
                            'text-xs px-3 py-2 rounded-xl border text-left transition-all font-medium',
                            local.agency_type === type
                              ? 'bg-indigo-500 text-white border-indigo-500'
                              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                          )}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {tab === 'categories' && (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="label mb-0">Kategoriler</label>
                      <button
                        onClick={() => update('categories', [...DEFAULT_CATEGORIES])}
                        className="text-2xs text-indigo-500 hover:text-indigo-600 flex items-center gap-1"
                      >
                        <RotateCcw size={10} /> Varsayilana don
                      </button>
                    </div>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={newCat}
                        onChange={(e) => setNewCat(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('categories', newCat, () => setNewCat('')))}
                        className="input flex-1"
                        placeholder="Yeni kategori..."
                      />
                      <button onClick={() => addTag('categories', newCat, () => setNewCat(''))} disabled={!newCat.trim()} className="btn-primary btn-sm"><Plus size={14} /></button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(local.categories || []).map((c) => (
                        <span key={c} className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/30 font-medium">
                          {c}
                          <button onClick={() => removeTag('categories', c)} className="p-0.5 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/50"><X size={10} /></button>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="label">KUYD Kategorileri</label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={newKuyd}
                        onChange={(e) => setNewKuyd(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('kuyd_options', newKuyd, () => setNewKuyd('')))}
                        className="input flex-1"
                        placeholder="Yeni KUYD..."
                      />
                      <button onClick={() => addTag('kuyd_options', newKuyd, () => setNewKuyd(''))} disabled={!newKuyd.trim()} className="btn-primary btn-sm"><Plus size={14} /></button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(local.kuyd_options || []).map((k) => (
                        <span key={k} className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-900/30 font-medium">
                          {k}
                          <button onClick={() => removeTag('kuyd_options', k)} className="p-0.5 rounded hover:bg-amber-100 dark:hover:bg-amber-900/50"><X size={10} /></button>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="label">Projeler</label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={newProject}
                        onChange={(e) => setNewProject(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('projects', newProject, () => setNewProject('')))}
                        className="input flex-1"
                        placeholder="Yeni proje..."
                      />
                      <button onClick={() => addTag('projects', newProject, () => setNewProject(''))} disabled={!newProject.trim()} className="btn-primary btn-sm"><Plus size={14} /></button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(local.projects || []).map((p) => (
                        <span key={p} className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/30 font-medium">
                          {p}
                          <button onClick={() => removeTag('projects', p)} className="p-0.5 rounded hover:bg-emerald-100 dark:hover:bg-emerald-900/50"><X size={10} /></button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {tab === 'columns' && (
                <div className="space-y-5">
                  <div>
                    <label className="label mb-2">Gorunur Kolonlar</label>
                    <div className="space-y-1.5">
                      {ALL_COLUMNS.map((col) => {
                        const isRequired = 'required' in col && col.required
                        const active = (local.visible_columns || []).includes(col.id)
                        return (
                          <button
                            key={col.id}
                            type="button"
                            onClick={() => toggleColumn(col.id)}
                            disabled={isRequired}
                            className={cn(
                              'w-full flex items-center gap-3 px-3 py-2 rounded-lg border text-left text-xs transition-all',
                              active ? 'border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 opacity-50',
                              isRequired && 'cursor-not-allowed'
                            )}
                          >
                            <div className={cn('w-4 h-4 rounded border-2 flex items-center justify-center shrink-0', active ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300 dark:border-gray-600')}>
                              {active && <Check size={10} className="text-white" />}
                            </div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">{col.label}</span>
                            {isRequired && <span className="text-2xs text-gray-400 ml-auto">Zorunlu</span>}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="label mb-2">Tablo Yogunlugu</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['compact', 'comfortable', 'spacious'] as const).map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => update('table_density', d)}
                          className={cn(
                            'text-xs px-3 py-2.5 rounded-xl border transition-all font-medium text-center',
                            local.table_density === d ? 'border-indigo-300 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-950/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                          )}
                        >
                          {d === 'compact' ? 'Kompakt' : d === 'comfortable' ? 'Normal' : 'Genis'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {tab === 'theme' && (
                <div className="grid grid-cols-3 gap-3">
                  {([
                    { id: 'system' as const, label: 'Sistem', icon: Monitor },
                    { id: 'light' as const, label: 'Acik', icon: Sun },
                    { id: 'dark' as const, label: 'Koyu', icon: Moon }
                  ]).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => update('theme', t.id)}
                      className={cn(
                        'flex flex-col items-center gap-3 px-4 py-5 rounded-xl border transition-all',
                        local.theme === t.id ? 'border-indigo-300 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-950/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                      )}
                    >
                      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', local.theme === t.id ? 'bg-indigo-100 dark:bg-indigo-900/40' : 'bg-gray-100 dark:bg-gray-700')}>
                        <t.icon size={22} className={local.theme === t.id ? 'text-indigo-500' : 'text-gray-400'} />
                      </div>
                      <p className="text-xs font-semibold text-gray-900 dark:text-white">{t.label}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 dark:border-gray-800">
              <motion.button whileTap={{ scale: 0.96 }} onClick={onClose} className="btn-secondary btn-sm">Iptal</motion.button>
              <motion.button whileTap={{ scale: 0.96 }} onClick={handleSave} disabled={updateSettings.isPending} className="btn-primary btn-sm">
                {updateSettings.isPending ? 'Kaydediliyor...' : 'Kaydet'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
