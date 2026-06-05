/**
 * Example: How to Use API Client in Components
 * 
 * This file demonstrates patterns for:
 * - Fetching data
 * - Error handling
 * - Loading states
 * - Using API responses
 */

'use client'

import { useEffect, useState } from 'react'
import { householdsAPI } from '@/lib/api/client'
import { Loader2 } from 'lucide-react'

interface Household {
  id: string
  name: string
  membersCount: number
  status: string
}

export function HouseholdsListExample() {
  const [households, setHouseholds] = useState<Household[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch households on mount
  useEffect(() => {
    const fetchHouseholds = async () => {
      try {
        setIsLoading(true)
        const response = await householdsAPI.list({
          search: searchQuery,
          page: 1,
          limit: 10,
        })
        setHouseholds(response.data.data || response.data)
        setError(null)
      } catch (err: any) {
        setError(
          err.response?.data?.message || err.message || 'Failed to fetch households'
        )
        console.error('Error fetching households:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHouseholds()
  }, [searchQuery])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-red-700 dark:text-red-400">{error}</p>
      </div>
    )
  }

  return (
    <div>
      {/* Search Input */}
      <input
        type="text"
        placeholder="Search households..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg mb-4"
      />

      {/* Households List */}
      <div className="space-y-2">
        {households.map((household) => (
          <div
            key={household.id}
            className="p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            <h3 className="font-semibold">{household.name}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {household.membersCount} members • {household.status}
            </p>
          </div>
        ))}
      </div>

      {households.length === 0 && (
        <p className="text-center text-slate-500 dark:text-slate-400 py-8">
          No households found
        </p>
      )}
    </div>
  )
}

/**
 * Example: Using SWR for Data Fetching (Recommended for Production)
 * 
 * Install: pnpm add swr
 */

import useSWR from 'swr'

export function HouseholdsListWithSWR() {
  const { data, error, isLoading } = useSWR('/households', (url) =>
    householdsAPI.list().then((res) => res.data)
  )

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      {data?.data.map((household: Household) => (
        <div key={household.id}>{household.name}</div>
      ))}
    </div>
  )
}

/**
 * Example: Creating a Household
 */

export function CreateHouseholdExample() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    governorate: '',
    primaryPhone: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      const response = await householdsAPI.create(formData)
      console.log('Household created:', response.data)
      // Reset form or redirect
      setFormData({ name: '', governorate: '', primaryPhone: '' })
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create household')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Household name"
        value={formData.name}
        onChange={(e) =>
          setFormData({ ...formData, name: e.target.value })
        }
        required
      />
      <input
        type="tel"
        placeholder="Phone"
        value={formData.primaryPhone}
        onChange={(e) =>
          setFormData({ ...formData, primaryPhone: e.target.value })
        }
        required
      />
      <button
        type="submit"
        disabled={isLoading}
        className="px-4 py-2 bg-green-500 text-white rounded-lg disabled:bg-slate-400"
      >
        {isLoading ? 'Creating...' : 'Create Household'}
      </button>
      {error && <p className="text-red-600">{error}</p>}
    </form>
  )
}
