"use client";

import { create } from "zustand";
import api from "@/lib/api/client";

/* ─────────── Families Store (Full Data Model) ─────────── */
interface FamiliesState {
  families: any[];
  filters: any;
  selectedFamily: any;
  loading?: boolean;
  error?: string | null;
  setFilters: (filters: any) => void;
  fetchFamilies: () => Promise<void>;
  fetchFamilyDetails: (id: string | number) => Promise<void>;
  setSelectedFamily: (family: any) => void;
  addFamily: (family: any) => void;
  updateFamily: (id: string | number, updates: any) => void;
  deleteFamily: (id: string | number) => Promise<void>;
  addMember: (familyId: string | number, member: any) => Promise<void>;
  updateMember: (familyId: string | number, memberId: string | number, updates: any) => Promise<void>;
  deleteMember: (familyId: string | number, memberId: string | number) => Promise<void>;
  addIncome: (familyId: string | number, income: any) => Promise<void>;
  deleteIncome: (familyId: string | number, incomeId: string | number) => Promise<void>;
  addExpense: (familyId: string | number, expense: any) => Promise<void>;
  deleteExpense: (familyId: string | number, expenseId: string | number) => Promise<void>;
  addMedicalRecord: (familyId: string | number, personId: string | number, record: any) => Promise<void>;
  deleteMedicalRecord: (familyId: string | number, recordId: string | number) => Promise<void>;
}

/** Debounce timer for search/filter changes — fires fetchFamilies 400ms after last setFilters call */
let _searchTimer: ReturnType<typeof setTimeout> | null = null;
function _scheduleSearch(get: () => FamiliesState) {
  if (_searchTimer) clearTimeout(_searchTimer);
  _searchTimer = setTimeout(() => {
    _searchTimer = null;
    get().fetchFamilies();
  }, 400);
}

export const useFamiliesStore = create<FamiliesState>()((set, get) => ({
  // ── Initial state: empty (data loaded from backend) ──

  families: [],
  filters: {
    search: "",
    classification: "all",
    category: "all",
  },
  selectedFamily: null,

  setFilters: (filters) => {
    set((state) => ({ filters: { ...state.filters, ...filters } }));
    _scheduleSearch(get);
  },

  fetchFamilies: async () => {
    try {
      set({ loading: true, error: null });
      const { filters } = get();
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.classification && filters.classification !== "all") {
        params.append("classification", filters.classification);
      }

      const response = await api.get(`/v1/families?${params.toString()}`);
      if (response.data.success) {
        set({ families: response.data.data, loading: false });
      }
    } catch (error) {
      console.error("Fetch families error", error);
      set({ error: "فشل تحميل البيانات", loading: false });
    }
  },

  fetchFamilyDetails: async (id) => {
    try {
      set({ loading: true, error: null });
      const response = await api.get(`/v1/families/${id}`);
      if (response.data.success) {
        const fullData = response.data.data;
        set((state) => ({
          families: state.families.some((f) => String(f.id) === String(id))
            ? state.families.map((f) => (String(f.id) === String(id) ? fullData : f))
            : [...state.families, fullData],
          loading: false,
        }));
      }
    } catch (error) {
      console.error("Fetch family details error", error);
      set({ error: "فشل تحميل تفاصيل الأسرة", loading: false });
    }
  },

  setSelectedFamily: (family) => set({ selectedFamily: family }),

  addFamily: (family: any) =>
    set((state: any) => ({
      families: [
        ...state.families,
        {
          ...family,
          id: family.id || Math.random().toString(36).substr(2, 9),
          members: family.members || [],
          income: family.income || [],
          expenses: family.expenses || [],
          medicalRecords: family.medicalRecords || [],
          totalIncome: family.totalIncome || 0,
          totalExpenses: family.totalExpenses || 0,
          vulnerabilityIndex: family.vulnerabilityIndex || 0,
          classification: family.classification || "متوسط",
        },
      ],
    })),

  updateFamily: (id: string | number, updates: any) =>
    set((state: any) => ({
      families: state.families.map((f: any) => (f.id === id ? { ...f, ...updates } : f)),
    })),

  deleteFamily: async (id) => {
    try {
      await api.delete(`/v1/families/${id}`);
      set((state) => ({
        families: state.families.filter((f) => f.id !== id),
      }));
    } catch (error) {
      console.error("Delete family error", error);
      throw error;
    }
  },

  /* ── Member CRUD ── */
  addMember: async (familyId, member) => {
    // Optimistic: add a temp placeholder immediately
    const tempId = `temp-${Date.now()}`;
    set((state: any) => ({
      families: state.families.map((f: any) =>
        String(f.id) === String(familyId)
          ? { ...f, members: [...(f.members || []), { ...member, id: tempId, _temp: true }] }
          : f
      ),
    }));
    try {
      const response = await api.post(`/v1/families/${familyId}/persons`, member);
      if (response.data.success) {
        const newMember = response.data.data ?? { ...member, id: tempId };
        // Replace temp with real server data
        set((state: any) => ({
          families: state.families.map((f: any) =>
            String(f.id) === String(familyId)
              ? {
                  ...f,
                  members: (f.members || []).map((m: any) =>
                    m.id === tempId ? { ...newMember, _temp: undefined } : m
                  ),
                }
              : f
          ),
        }));
      }
    } catch (error) {
      // Rollback on failure
      set((state: any) => ({
        families: state.families.map((f: any) =>
          String(f.id) === String(familyId)
            ? { ...f, members: (f.members || []).filter((m: any) => m.id !== tempId) }
            : f
        ),
      }));
      console.error("Add member error", error);
      throw error;
    }
  },

  updateMember: async (familyId, memberId, updates) => {
    // Snapshot for rollback
    const prev = get().families;
    set((state: any) => ({
      families: state.families.map((f: any) => {
        if (String(f.id) !== String(familyId)) return f;
        return {
          ...f,
          members: Array.isArray(f.members)
            ? f.members.map((m: any) => (String(m.id) === String(memberId) ? { ...m, ...updates } : m))
            : f.members,
        };
      }),
    }));
    try {
      await api.patch(`/v1/families/persons/${memberId}`, updates);
    } catch (error) {
      set({ families: prev });
      console.error("Update member error", error);
      throw error;
    }
  },

  deleteMember: async (familyId, memberId) => {
    // Optimistic remove
    const prev = get().families;
    set((state: any) => ({
      families: state.families.map((f: any) =>
        String(f.id) === String(familyId)
          ? { ...f, members: (f.members || []).filter((m: any) => String(m.id) !== String(memberId)) }
          : f
      ),
    }));
    try {
      await api.delete(`/v1/families/persons/${memberId}`);
    } catch (error) {
      set({ families: prev });
      console.error("Delete member error", error);
      throw error;
    }
  },

  /* ── Income CRUD ── */
  addIncome: async (familyId, income) => {
    const tempId = `temp-${Date.now()}`;
    set((state: any) => ({
      families: state.families.map((f: any) =>
        String(f.id) === String(familyId)
          ? { ...f, incomes: [...(f.incomes || f.income || []), { ...income, id: tempId, _temp: true }] }
          : f
      ),
    }));
    try {
      const response = await api.post(`/v1/families/${familyId}/incomes`, income);
      if (response.data.success) {
        const newIncome = response.data.data ?? { ...income, id: tempId };
        set((state: any) => ({
          families: state.families.map((f: any) =>
            String(f.id) === String(familyId)
              ? {
                  ...f,
                  incomes: (f.incomes || f.income || []).map((inc: any) =>
                    inc.id === tempId ? { ...newIncome, _temp: undefined } : inc
                  ),
                }
              : f
          ),
        }));
      }
    } catch (error) {
      set((state: any) => ({
        families: state.families.map((f: any) =>
          String(f.id) === String(familyId)
            ? { ...f, incomes: (f.incomes || f.income || []).filter((inc: any) => inc.id !== tempId) }
            : f
        ),
      }));
      console.error("Add income error", error);
      throw error;
    }
  },

  deleteIncome: async (familyId, incomeId) => {
    const prev = get().families;
    set((state: any) => ({
      families: state.families.map((f: any) =>
        String(f.id) === String(familyId)
          ? {
              ...f,
              incomes: (f.incomes || f.income || []).filter((inc: any) => String(inc.id) !== String(incomeId)),
              income: (f.income || f.incomes || []).filter((inc: any) => String(inc.id) !== String(incomeId)),
            }
          : f
      ),
    }));
    try {
      await api.delete(`/v1/families/incomes/${incomeId}`);
    } catch (error) {
      set({ families: prev });
      console.error("Delete income error", error);
      throw error;
    }
  },

  /* ── Expenses CRUD ── */
  addExpense: async (familyId, expense) => {
    const tempId = `temp-${Date.now()}`;
    set((state: any) => ({
      families: state.families.map((f: any) =>
        String(f.id) === String(familyId)
          ? { ...f, expenses: [...(f.expenses || []), { ...expense, id: tempId, _temp: true }] }
          : f
      ),
    }));
    try {
      const response = await api.post(`/v1/families/${familyId}/expenses`, expense);
      if (response.data.success) {
        const newExpense = response.data.data ?? { ...expense, id: tempId };
        set((state: any) => ({
          families: state.families.map((f: any) =>
            String(f.id) === String(familyId)
              ? {
                  ...f,
                  expenses: (f.expenses || []).map((exp: any) =>
                    exp.id === tempId ? { ...newExpense, _temp: undefined } : exp
                  ),
                }
              : f
          ),
        }));
      }
    } catch (error) {
      set((state: any) => ({
        families: state.families.map((f: any) =>
          String(f.id) === String(familyId)
            ? { ...f, expenses: (f.expenses || []).filter((exp: any) => exp.id !== tempId) }
            : f
        ),
      }));
      console.error("Add expense error", error);
      throw error;
    }
  },

  deleteExpense: async (familyId, expenseId) => {
    const prev = get().families;
    set((state: any) => ({
      families: state.families.map((f: any) =>
        String(f.id) === String(familyId)
          ? { ...f, expenses: (f.expenses || []).filter((exp: any) => String(exp.id) !== String(expenseId)) }
          : f
      ),
    }));
    try {
      await api.delete(`/v1/families/expenses/${expenseId}`);
    } catch (error) {
      set({ families: prev });
      console.error("Delete expense error", error);
      throw error;
    }
  },

  /* ── Medical Records CRUD ── */
  addMedicalRecord: async (familyId, personId, record) => {
    const tempId = `temp-${Date.now()}`;
    set((state: any) => ({
      families: state.families.map((f: any) =>
        String(f.id) === String(familyId)
          ? { ...f, medicalRecords: [...(f.medicalRecords || []), { ...record, id: tempId, personId, _temp: true }] }
          : f
      ),
    }));
    try {
      const response = await api.post(`/v1/families/persons/${personId}/medical`, record);
      if (response.data.success) {
        const newRecord = response.data.data ?? { ...record, id: tempId, personId };
        set((state: any) => ({
          families: state.families.map((f: any) =>
            String(f.id) === String(familyId)
              ? {
                  ...f,
                  medicalRecords: (f.medicalRecords || []).map((r: any) =>
                    r.id === tempId ? { ...newRecord, _temp: undefined } : r
                  ),
                }
              : f
          ),
        }));
      }
    } catch (error) {
      set((state: any) => ({
        families: state.families.map((f: any) =>
          String(f.id) === String(familyId)
            ? { ...f, medicalRecords: (f.medicalRecords || []).filter((r: any) => r.id !== tempId) }
            : f
        ),
      }));
      console.error("Add medical record error", error);
      throw error;
    }
  },

  deleteMedicalRecord: async (familyId, recordId) => {
    const prev = get().families;
    set((state: any) => ({
      families: state.families.map((f: any) =>
        String(f.id) === String(familyId)
          ? { ...f, medicalRecords: (f.medicalRecords || []).filter((r: any) => String(r.id) !== String(recordId)) }
          : f
      ),
    }));
    try {
      await api.delete(`/v1/families/medical/${recordId}`);
    } catch (error) {
      set({ families: prev });
      console.error("Delete medical record error", error);
      throw error;
    }
  },
}));
