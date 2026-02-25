import { useState, useMemo, useCallback } from 'react'
import { Header } from './components/Header'
import { FilterBar } from './components/FilterBar'
import { StatsBar } from './components/StatsBar'
import { InfluencerTable } from './components/InfluencerTable'
import { InfluencerForm } from './components/InfluencerForm'
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

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header onAddClick={handleAdd} influencerCount={data.length} />
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
      <InfluencerForm influencer={editTarget} open={formOpen} onClose={handleCloseForm} />
    </div>
  )
}
