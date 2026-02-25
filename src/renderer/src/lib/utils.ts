import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export function formatCount(n: number): string {
  if (!n) return '-'
  if (n >= 1_000_000) {
    const v = n / 1_000_000
    return v % 1 === 0 ? `${v}M` : `${v.toFixed(1)}M`
  }
  if (n >= 1_000) {
    const v = n / 1_000
    return v % 1 === 0 ? `${v}K` : `${v.toFixed(1)}K`
  }
  return String(n)
}

export function parseCategories(raw: string | string[]): string[] {
  if (Array.isArray(raw)) return raw
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  }
}

export const CATEGORY_OPTIONS = [
  'Fashion',
  'Beauty',
  'Lifestyle',
  'Entertainment',
  'Sports',
  'Student',
  'Kitchen',
  'Art',
  'Pet',
  'Ski',
  'Music',
  'Travel',
  'Technology',
  'Food',
  'Gaming',
  'Fitness'
]

export const KUYD_OPTIONS = [
  'İş Paola',
  'Proje Oluştur',
  'İşbirliklerine Odaklan',
  'Sabıcoz Kalım',
  'Sabicoz Kalım'
]
