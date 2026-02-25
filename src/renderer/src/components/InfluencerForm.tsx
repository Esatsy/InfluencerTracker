import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { Influencer } from '../types/influencer'
import { CATEGORY_OPTIONS, KUYD_OPTIONS, parseCategories } from '../lib/utils'
import { useCreateInfluencer, useUpdateInfluencer } from '../hooks/useInfluencers'

interface InfluencerFormProps {
  influencer: Influencer | null
  open: boolean
  onClose: () => void
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

export function InfluencerForm({ influencer, open, onClose }: InfluencerFormProps) {
  const [form, setForm] = useState<FormData>(defaultForm)
  const create = useCreateInfluencer()
  const update = useUpdateInfluencer()
  const isEdit = !!influencer

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

  if (!open) return null

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

    if (isEdit && influencer) {
      await update.mutateAsync({ id: influencer.id, data: payload })
    } else {
      await create.mutateAsync(payload)
    }
    onClose()
  }

  const saving = create.isPending || update.isPending

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-4 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <h2 className="text-sm font-semibold">
            {isEdit ? 'Influencer Duzenle' : 'Yeni Influencer Ekle'}
          </h2>
          <button onClick={onClose} className="btn-ghost p-1 rounded-md">
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Name */}
          <div>
            <label className="label">Influencer Adi *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              className="input"
              placeholder="Adi Soyadi"
              required
            />
          </div>

          {/* Social Media */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">Instagram</label>
              <input
                type="text"
                value={form.instagram_username}
                onChange={(e) => set('instagram_username', e.target.value)}
                className="input"
                placeholder="kullanici_adi"
              />
            </div>
            <div>
              <label className="label">TikTok</label>
              <input
                type="text"
                value={form.tiktok_username}
                onChange={(e) => set('tiktok_username', e.target.value)}
                className="input"
                placeholder="kullanici_adi"
              />
            </div>
            <div>
              <label className="label">YouTube</label>
              <input
                type="text"
                value={form.youtube_username}
                onChange={(e) => set('youtube_username', e.target.value)}
                className="input"
                placeholder="kanal_adi"
              />
            </div>
          </div>

          {/* Follower counts (manual override) */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">IG Takipci</label>
              <input
                type="number"
                value={form.instagram_followers || ''}
                onChange={(e) => set('instagram_followers', Number(e.target.value))}
                className="input"
                placeholder="0"
                min={0}
              />
            </div>
            <div>
              <label className="label">TT Takipci</label>
              <input
                type="number"
                value={form.tiktok_followers || ''}
                onChange={(e) => set('tiktok_followers', Number(e.target.value))}
                className="input"
                placeholder="0"
                min={0}
              />
            </div>
            <div>
              <label className="label">YT Abone</label>
              <input
                type="number"
                value={form.youtube_followers || ''}
                onChange={(e) => set('youtube_followers', Number(e.target.value))}
                className="input"
                placeholder="0"
                min={0}
              />
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="label">Kategoriler</label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORY_OPTIONS.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    form.categories.includes(cat)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-700 hover:border-blue-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Demographics */}
          <div>
            <label className="label">Demografik Veriler</label>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="text-2xs text-gray-400">Women %</label>
                <input
                  type="number"
                  value={form.women_pct || ''}
                  onChange={(e) => set('women_pct', Number(e.target.value))}
                  className="input py-1 text-xs"
                  min={0}
                  max={100}
                />
              </div>
              <div>
                <label className="text-2xs text-gray-400">Men %</label>
                <input
                  type="number"
                  value={form.men_pct || ''}
                  onChange={(e) => set('men_pct', Number(e.target.value))}
                  className="input py-1 text-xs"
                  min={0}
                  max={100}
                />
              </div>
              <div>
                <label className="text-2xs text-gray-400">TR %</label>
                <input
                  type="number"
                  value={form.tr_pct || ''}
                  onChange={(e) => set('tr_pct', Number(e.target.value))}
                  className="input py-1 text-xs"
                  min={0}
                  max={100}
                />
              </div>
              <div />
            </div>
          </div>

          {/* Age groups */}
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
                  <label className="text-2xs text-gray-400">{ag.label}</label>
                  <input
                    type="number"
                    value={form[ag.key] || ''}
                    onChange={(e) => set(ag.key, Number(e.target.value))}
                    className="input py-1 text-xs"
                    min={0}
                    max={100}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* KUYD & Project */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">KUYD Kategori</label>
              <select
                value={form.kuyd_category}
                onChange={(e) => set('kuyd_category', e.target.value)}
                className="input"
              >
                <option value="">Sec...</option>
                {KUYD_OPTIONS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Proje</label>
              <input
                type="text"
                value={form.project}
                onChange={(e) => set('project', e.target.value)}
                className="input"
                placeholder="Proje adi"
              />
            </div>
          </div>

          {/* Notes */}
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

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t bg-gray-50 dark:bg-gray-900/50">
          <button type="button" onClick={onClose} className="btn-secondary btn-sm">
            Iptal
          </button>
          <button
            onClick={handleSubmit as () => void}
            disabled={saving || !form.name.trim()}
            className="btn-primary btn-sm"
          >
            {saving ? 'Kaydediliyor...' : isEdit ? 'Guncelle' : 'Ekle'}
          </button>
        </div>
      </div>
    </div>
  )
}
