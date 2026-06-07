'use client'

// frontend/lib/disbursement/store.ts
// Zustand store for disbursement module — follows the same pattern as householdStore.ts

import { create } from 'zustand'
import {
  listMonths,
  getMonth,
  openMonth,
  calculateMonth,
  approveMonth,
  reopenMonth,
  adjustPayment,
  updatePaymentStatus,
  simulateMonth,
  addExternalContribution,
  getCategoryConfigs,
  updateCategoryConfig,
  getGrantConfigs,
  updateGrantConfig,
} from '@/lib/api/disbursement-api'
import type {
  DisbursementMonth,
  MonthlyPayment,
  CategoryConfig,
  GrantConfig,
  SimulateResult,
} from './types'

interface DisbursementState {
  // List
  months: DisbursementMonth[]
  monthsTotal: number

  // Current month detail
  currentMonth: DisbursementMonth | null
  payments: MonthlyPayment[]
  paymentsTotal: number

  // Config
  categories: CategoryConfig[]
  grants: GrantConfig[]

  // Simulate
  simulation: SimulateResult | null

  // UI
  loading: boolean
  calculating: boolean
  error: string | null
}

interface DisbursementActions {
  fetchMonths: (params?: Record<string, string | number | undefined>) => Promise<void>
  fetchMonth:  (id: string) => Promise<void>
  openMonth:   (body: { period: string; method: string; totalBudget?: number; notes?: string }) => Promise<DisbursementMonth>
  calculateMonth:      (monthId: string) => Promise<void>
  approveMonth:        (monthId: string, notes?: string) => Promise<void>
  reopenMonth:         (monthId: string, reason: string) => Promise<void>
  adjustPayment:       (monthId: string, paymentId: string, body: { manualAdjustment: number; adjustmentReason: string; fundSource?: string }) => Promise<void>
  updatePaymentStatus: (monthId: string, paymentId: string, body: { meezaStatus?: string; cashStatus?: string }) => Promise<void>
  simulate:            (body: { method: string; totalBudget?: number }) => Promise<void>
  fetchCategories:     () => Promise<void>
  updateCategory:      (code: string, body: Partial<CategoryConfig>) => Promise<void>
  fetchGrants:         () => Promise<void>
  updateGrant:         (code: string, body: Partial<GrantConfig>) => Promise<void>
  addContribution:     (body: { householdId: string; period: string; institutionName: string; amount: number; confirmed?: boolean; notes?: string }) => Promise<void>
  clearError:          () => void
  reset:               () => void
}

const initialState: DisbursementState = {
  months: [],
  monthsTotal: 0,
  currentMonth: null,
  payments: [],
  paymentsTotal: 0,
  categories: [],
  grants: [],
  simulation: null,
  loading: false,
  calculating: false,
  error: null,
}

export const useDisbursementStore = create<DisbursementState & DisbursementActions>(
  (set, get) => ({
    ...initialState,

    fetchMonths: async (params) => {
      set({ loading: true, error: null })
      try {
        const { months, total } = await listMonths(params)
        set({ months, monthsTotal: total })
      } catch (e) {
        set({ error: (e as Error).message })
        throw e
      } finally {
        set({ loading: false })
      }
    },

    fetchMonth: async (id) => {
      set({ loading: true, error: null })
      try {
        const month = await getMonth(id)
        set({
          currentMonth: month,
          payments: month.payments ?? [],
          paymentsTotal: month.payments?.length ?? 0,
        })
      } catch (e) {
        set({ error: (e as Error).message })
        throw e
      } finally {
        set({ loading: false })
      }
    },

    openMonth: async (body) => {
      set({ loading: true, error: null })
      try {
        const month = await openMonth(body)
        await get().fetchMonths()
        return month
      } catch (e) {
        set({ error: (e as Error).message })
        throw e
      } finally {
        set({ loading: false })
      }
    },

    calculateMonth: async (monthId) => {
      set({ calculating: true, error: null })
      try {
        await calculateMonth(monthId)
        await get().fetchMonth(monthId)
      } catch (e) {
        set({ error: (e as Error).message })
        throw e
      } finally {
        set({ calculating: false })
      }
    },

    approveMonth: async (monthId, notes) => {
      set({ loading: true, error: null })
      try {
        await approveMonth(monthId, notes)
        await get().fetchMonth(monthId)
      } catch (e) {
        set({ error: (e as Error).message })
        throw e
      } finally {
        set({ loading: false })
      }
    },

    reopenMonth: async (monthId, reason) => {
      set({ loading: true, error: null })
      try {
        await reopenMonth(monthId, reason)
        await get().fetchMonth(monthId)
      } catch (e) {
        set({ error: (e as Error).message })
        throw e
      } finally {
        set({ loading: false })
      }
    },

    adjustPayment: async (monthId, paymentId, body) => {
      try {
        await adjustPayment(monthId, paymentId, body)
        await get().fetchMonth(monthId)
      } catch (e) {
        set({ error: (e as Error).message })
        throw e
      }
    },

    updatePaymentStatus: async (monthId, paymentId, body) => {
      try {
        await updatePaymentStatus(monthId, paymentId, body)
        await get().fetchMonth(monthId)
      } catch (e) {
        set({ error: (e as Error).message })
        throw e
      }
    },

    simulate: async (body) => {
      set({ loading: true, simulation: null, error: null })
      try {
        const result = await simulateMonth(body)
        set({ simulation: result })
      } catch (e) {
        set({ error: (e as Error).message })
        throw e
      } finally {
        set({ loading: false })
      }
    },

    fetchCategories: async () => {
      const cats = await getCategoryConfigs()
      set({ categories: cats })
    },

    updateCategory: async (code, body) => {
      await updateCategoryConfig(code, body)
      await get().fetchCategories()
    },

    fetchGrants: async () => {
      const grants = await getGrantConfigs()
      set({ grants })
    },

    updateGrant: async (code, body) => {
      await updateGrantConfig(code, body)
      await get().fetchGrants()
    },

    addContribution: async (body) => {
      await addExternalContribution(body)
    },

    clearError: () => set({ error: null }),
    reset:      () => set(initialState),
  }),
)
