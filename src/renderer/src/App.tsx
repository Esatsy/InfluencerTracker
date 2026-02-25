import { useState, useMemo, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { Header } from './components/Header'
import { FilterBar } from './components/FilterBar'
import { StatsBar } from './components/StatsBar'
import { InfluencerTable } from './components/InfluencerTable'
import { InfluencerForm } from './components/InfluencerForm'
import { SetupWizard } from './components/SetupWizard'
import { SettingsPanel } from './components/SettingsPanel'
import { useInfluencers } from './hooks/useInfluencers'
import { useSettings } from './hooks/useSettings'
import type { Influencer } from './types/influencer'

export default function App() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [kuyd, setKuyd] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Influencer | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const { data: settings, isLoading: settingsLoading } = useSettings()

  const filters = useMemo(
    () => ({
      search: search || undefined,
      category: category || undefined,
      kuyd: kuyd || undefined
    }),
    [search, category, kuyd]
  )

  const { data = [], isLoading } = useInfluencers(filters)

  const handleAdd = useCallback(() => {
    setEditTarget(null)
    setFormOpen(true)
  }, [])

  const handleEdit = useCallback((inf: Influencer) => {
    setEditTarget(inf)
    setFormOpen(true)
  }, [])

  const handleCloseForm = useCallback(() => {
    setFormOpen(false)
    setEditTarget(null)
  }, [])

  const [wizardDone, setWizardDone] = useState(false)

  if (settingsLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const showWizard = settings && !settings.setup_completed && !wizardDone

  if (showWizard) {
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--color-surface, #fff)',
              color: 'var(--color-text-primary, #0f172a)',
              border: '1px solid var(--color-border, #e2e8f0)',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 500,
              boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
              padding: '10px 16px'
            }
          }}
        />
        <SetupWizard onComplete={() => setWizardDone(true)} />
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--color-surface, #fff)',
            color: 'var(--color-text-primary, #0f172a)',
            border: '1px solid var(--color-border, #e2e8f0)',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: 500,
            boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
            padding: '10px 16px'
          },
          success: { iconTheme: { primary: '#6366f1', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } }
        }}
      />

      <Header
        onAddClick={handleAdd}
        influencerCount={data.length}
        onSettingsClick={() => setSettingsOpen(true)}
        settings={settings!}
      />
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        kuyd={kuyd}
        onKuydChange={setKuyd}
        settings={settings!}
      />
      <StatsBar data={data} settings={settings!} />
      <InfluencerTable
        data={data}
        onEdit={handleEdit}
        isLoading={isLoading}
        settings={settings!}
      />
      <InfluencerForm
        influencer={editTarget}
        open={formOpen}
        onClose={handleCloseForm}
        settings={settings!}
      />
      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  )
}
