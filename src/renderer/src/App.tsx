import { useState, useMemo, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { Header } from './components/Header'
import { FilterBar } from './components/FilterBar'
import { StatsBar } from './components/StatsBar'
import { InfluencerTable } from './components/InfluencerTable'
import { InfluencerForm } from './components/InfluencerForm'
import { Welcome } from './components/Welcome'
import { useInfluencers } from './hooks/useInfluencers'
import type { Influencer } from './types/influencer'

export default function App() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [kuyd, setKuyd] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Influencer | null>(null)

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

  const showWelcome = !isLoading && data.length === 0 && !search && !category && !kuyd

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
          success: {
            iconTheme: {
              primary: '#6366f1',
              secondary: '#fff'
            }
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff'
            }
          }
        }}
      />

      <Header onAddClick={handleAdd} influencerCount={data.length} />

      <AnimatePresence mode="wait">
        {showWelcome ? (
          <Welcome key="welcome" onAddClick={handleAdd} />
        ) : (
          <>
            <FilterBar
              search={search}
              onSearchChange={setSearch}
              category={category}
              onCategoryChange={setCategory}
              kuyd={kuyd}
              onKuydChange={setKuyd}
            />
            <StatsBar data={data} />
            <InfluencerTable data={data} onEdit={handleEdit} isLoading={isLoading} />
          </>
        )}
      </AnimatePresence>

      <InfluencerForm
        influencer={editTarget}
        open={formOpen}
        onClose={handleCloseForm}
      />
    </div>
  )
}
