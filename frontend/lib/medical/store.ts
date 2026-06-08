"use client";

import { create } from "zustand";
import { useMedicalModalStore } from "../stores/medicalModalStore";
import type { AidType, EligibilityLevel } from "@/types/medical";

type FilterStatus = "pending" | "approved" | "disbursed" | "rejected";

interface DashboardFilters {
  search: string;
  status?: FilterStatus;
  aidType?: AidType;
  eligibilityLevel?: EligibilityLevel;
}

interface DashboardFiltersState {
  filters: DashboardFilters;
  setSearch: (search: string) => void;
  setStatus: (status?: FilterStatus) => void;
  setAidType: (aidType?: AidType) => void;
  setEligibilityLevel: (eligibilityLevel?: EligibilityLevel) => void;
  resetFilters: () => void;
}

export { useMedicalModalStore };

export const useDashboardFiltersStore = create<DashboardFiltersState>((set) => ({
  filters: { search: "" },
  setSearch: (search) => set((state) => ({ filters: { ...state.filters, search } })),
  setStatus: (status) => set((state) => ({ filters: { ...state.filters, status } })),
  setAidType: (aidType) => set((state) => ({ filters: { ...state.filters, aidType } })),
  setEligibilityLevel: (eligibilityLevel) =>
    set((state) => ({ filters: { ...state.filters, eligibilityLevel } })),
  resetFilters: () => set({ filters: { search: "" } }),
}));
