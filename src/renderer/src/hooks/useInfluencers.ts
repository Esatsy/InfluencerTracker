import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { Influencer } from '../types/influencer'

export function useInfluencers(filters?: {
  search?: string
  category?: string
  kuyd?: string
}) {
  return useQuery({
    queryKey: ['influencers', filters],
    queryFn: () => api.getInfluencers(filters),
    refetchOnWindowFocus: false
  })
}

export function useCreateInfluencer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Influencer>) => api.createInfluencer(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['influencers'] })
  })
}

export function useUpdateInfluencer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Influencer> }) =>
      api.updateInfluencer(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['influencers'] })
  })
}

export function useDeleteInfluencer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.deleteInfluencer(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['influencers'] })
  })
}

export function useScrapeInfluencer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.scrapeInfluencer(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['influencers'] })
  })
}

export function useScrapeAll() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.scrapeAll(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['influencers'] })
  })
}

export function useImportExcel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => api.importExcel(file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['influencers'] })
  })
}
