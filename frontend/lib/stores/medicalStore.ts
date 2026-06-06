import { create } from 'zustand'
import { medicalApi } from '../api/medical-api'
import type { MedicalCase, MedicalDisbursement } from '../../types/medical'

interface MedicalState {
  cases: MedicalCase[]
  selectedCase: MedicalCase | null
  isModalOpen: boolean
  isSheetOpen: boolean
  selectedHouseholdForSheet: string | null
  searchQuery: string
  filterAidType: string
  filterCriticalOnly: boolean
  
  isLoading: boolean
  error: string | null
  kpis: { totalCases: number; criticalCases: number; monthlyEstimate: number } | null
  totalPages: number
  currentPage: number

  // Actions
  setSelectedCase: (c: MedicalCase | null) => void
  openModal: (c?: MedicalCase) => void
  closeModal: () => void
  openSheet: (householdId: string) => void
  closeSheet: () => void
  setSearch: (q: string) => void
  setFilterAidType: (t: string) => void
  setFilterCritical: (v: boolean) => void
  addCase: (c: MedicalCase) => void
  addDisbursement: (caseId: string, d: MedicalDisbursement) => void

  loadCases: (params?: any) => Promise<void>
  loadKpis: () => Promise<void>
  refreshCase: (id: string) => Promise<void>
}

export const useMedicalStore = create<MedicalState>((set) => ({
  cases: [],
  kpis: null,
  isLoading: false,
  error: null,
  totalPages: 1,
  currentPage: 1,

  selectedCase: null,
  isModalOpen: false,
  isSheetOpen: false,
  selectedHouseholdForSheet: null,
  searchQuery: '',
  filterAidType: '',
  filterCriticalOnly: false,
  
  setSelectedCase: (c) => set({ selectedCase: c }),
  openModal: (c) => set({ isModalOpen: true, selectedCase: c ?? null }),
  closeModal: () => set({ isModalOpen: false, selectedCase: null }),
  openSheet: (id) => set({ isSheetOpen: true, selectedHouseholdForSheet: id }),
  closeSheet: () => set({ isSheetOpen: false, selectedHouseholdForSheet: null }),
  setSearch: (q) => set({ searchQuery: q }),
  setFilterAidType: (t) => set({ filterAidType: t }),
  setFilterCritical: (v) => set({ filterCriticalOnly: v }),
  
  addCase: (c) => set((s) => ({ cases: [c, ...s.cases] })),
  addDisbursement: (caseId, d) => set((s) => ({
    cases: s.cases.map(c => c.id === caseId
      ? { ...c, disbursements: [d, ...(c.disbursements || [])], lastDisbursementDate: d.disbursementDate }
      : c)
  })),

  loadCases: async (params) => {
    set({ isLoading: true, error: null })
    try {
      const result = await medicalApi.listCases(params)
      set({
        cases: result.cases,
        totalPages: result.totalPages,
        currentPage: result.page,
        isLoading: false,
      })
    } catch (err) {
      set({ error: 'تعذّر تحميل البيانات', isLoading: false })
    }
  },

  loadKpis: async () => {
    try {
      const kpis = await medicalApi.getKpis()
      set({ kpis })
    } catch (_) {}
  },

  refreshCase: async (id) => {
    const updated = await medicalApi.getCaseById(id)
    set(s => ({ cases: s.cases.map(c => c.id === id ? updated : c) }))
  },
}))
