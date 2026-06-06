import { create } from "zustand";
import type {
  AidType,
  EligibilityLevel,
  Household,
  Person,
} from "../../types/medical";

interface MedicalModalState {
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  currentStep: 1 | 2 | 3;
  setStep: (step: 1 | 2 | 3) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetSteps: () => void;

  selectedHousehold: any | null;
  setSelectedHousehold: (household: any | null) => void;
  selectedPerson: any | null;
  setSelectedPerson: (person: any | null) => void;

  medicalCondition: string;
  setMedicalCondition: (condition: string) => void;
  severity: "mild" | "moderate" | "severe";
  setSeverity: (severity: "mild" | "moderate" | "severe") => void;
  medicalNotes: string;
  setMedicalNotes: (notes: string) => void;

  aidType: string | null;
  setAidType: (type: string | null) => void;
  amount: number;
  setAmount: (amount: number) => void;
  aidNotes: string;
  setAidNotes: (notes: string) => void;

  calculatedEligibility: string;
  setCalculatedEligibility: (level: string) => void;

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
