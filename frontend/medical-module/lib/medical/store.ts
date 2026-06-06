/**
 * CharityHub Medical Module - State Management with Zustand
 * Manages modal state, selected household/person, and form data
 */

import { create } from "zustand";
import type {
  AidDisbursement,
  AidType,
  EligibilityLevel,
  Household,
  Person,
  SearchFilters,
} from "@/types/medical";

interface MedicalModalState {
  // Modal visibility
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;

  // Step tracking
  currentStep: 1 | 2 | 3;
  setStep: (step: 1 | 2 | 3) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetSteps: () => void;

  // Form data
  selectedHousehold: Household | null;
  setSelectedHousehold: (household: Household | null) => void;

  selectedPerson: Person | null;
  setSelectedPerson: (person: Person | null) => void;

  // Step 2: Medical data
  medicalCondition: string;
  setMedicalCondition: (condition: string) => void;

  severity: "mild" | "moderate" | "severe";
  setSeverity: (severity: "mild" | "moderate" | "severe") => void;

  medicalNotes: string;
  setMedicalNotes: (notes: string) => void;

  // Step 3: Aid data
  aidType: AidType | null;
  setAidType: (type: AidType | null) => void;

  amount: number;
  setAmount: (amount: number) => void;

  aidNotes: string;
  setAidNotes: (notes: string) => void;

  // Eligibility
  calculatedEligibility: EligibilityLevel;
  setCalculatedEligibility: (level: EligibilityLevel) => void;

  // Reset all form data
  resetFormData: () => void;
}

export const useMedicalModalStore = create<MedicalModalState>((set) => ({
  isModalOpen: false,
  openModal: () => set({ isModalOpen: true }),
  closeModal: () =>
    set({
      isModalOpen: false,
      currentStep: 1,
      selectedHousehold: null,
      selectedPerson: null,
      medicalCondition: "",
      severity: "mild",
      medicalNotes: "",
      aidType: null,
      amount: 0,
      aidNotes: "",
      calculatedEligibility: "pending",
    }),

  currentStep: 1,
  setStep: (step) => set({ currentStep: step }),
  nextStep: () =>
    set((state) => ({
      currentStep: (state.currentStep + 1) as 1 | 2 | 3,
    })),
  prevStep: () =>
    set((state) => ({
      currentStep: Math.max(1, state.currentStep - 1) as 1 | 2 | 3,
    })),
  resetSteps: () => set({ currentStep: 1 }),

  selectedHousehold: null,
  setSelectedHousehold: (household) => set({ selectedHousehold: household }),

  selectedPerson: null,
  setSelectedPerson: (person) => set({ selectedPerson: person }),

  medicalCondition: "",
  setMedicalCondition: (condition) => set({ medicalCondition: condition }),

  severity: "mild",
  setSeverity: (severity) => set({ severity }),

  medicalNotes: "",
  setMedicalNotes: (notes) => set({ medicalNotes: notes }),

  aidType: null,
  setAidType: (type) => set({ aidType: type }),

  amount: 0,
  setAmount: (amount) => set({ amount }),

  aidNotes: "",
  setAidNotes: (notes) => set({ aidNotes: notes }),

  calculatedEligibility: "pending",
  setCalculatedEligibility: (level) => set({ calculatedEligibility: level }),

  resetFormData: () =>
    set({
      selectedHousehold: null,
      selectedPerson: null,
      medicalCondition: "",
      severity: "mild",
      medicalNotes: "",
      aidType: null,
      amount: 0,
      aidNotes: "",
      calculatedEligibility: "pending",
    }),
}));

/**
 * Dashboard filters store
 */
interface DashboardFiltersState {
  filters: SearchFilters;
  setSearch: (search: string) => void;
  setStatus: (status?: "pending" | "approved" | "disbursed" | "rejected") => void;
  setAidType: (aidType?: AidType) => void;
  setEligibilityLevel: (level?: EligibilityLevel) => void;
  resetFilters: () => void;
}

export const useDashboardFiltersStore = create<DashboardFiltersState>((set) => ({
  filters: {
    search: "",
    status: undefined,
    aidType: undefined,
    eligibilityLevel: undefined,
  },

  setSearch: (search) =>
    set((state) => ({
      filters: { ...state.filters, search },
    })),

  setStatus: (status) =>
    set((state) => ({
      filters: { ...state.filters, status },
    })),

  setAidType: (aidType) =>
    set((state) => ({
      filters: { ...state.filters, aidType },
    })),

  setEligibilityLevel: (eligibilityLevel) =>
    set((state) => ({
      filters: { ...state.filters, eligibilityLevel },
    })),

  resetFilters: () =>
    set({
      filters: {
        search: "",
        status: undefined,
        aidType: undefined,
        eligibilityLevel: undefined,
      },
    }),
}));

/**
 * Pagination store
 */
interface PaginationState {
  currentPage: number;
  pageSize: number;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  resetPagination: () => void;
}

export const usePaginationStore = create<PaginationState>((set) => ({
  currentPage: 1,
  pageSize: 10,
  setCurrentPage: (page) => set({ currentPage: page }),
  setPageSize: (size) => set({ pageSize: size, currentPage: 1 }),
  resetPagination: () => set({ currentPage: 1, pageSize: 10 }),
}));
