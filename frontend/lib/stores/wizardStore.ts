"use client";

import { create } from "zustand";
import { updateHousehold, createHousehold } from "@/lib/api/households-api";
import { useScoringStore } from "./scoringStore";
import type { HouseholdDto, PersonDto, IncomeSourceDto } from "@/lib/types/api";

export type AutosaveStatus = "idle" | "saving" | "synced" | "error";

export interface WizardPersonForm extends Partial<PersonDto> {
  _localKey?: string;
  hasDisease?: boolean;
  hasDisability?: boolean;
  diseasesDraft?: Array<Partial<{ id?: string; treatmentCost: string; followup: string; workImpact: string }>>;
  disabilitiesDraft?: Array<Partial<{ id?: string; workImpact: string; companion: string; treatmentCost: string }>>;
}

export interface WizardFormData {
  code?: string;
  socialStatus?: "MARRIED" | "DIVORCED" | "WIDOWED" | "SINGLE_OTHER";
  divorceYear?: string;
  divorceDocNumber?: string;
  marriageCount?: number;
  deathCertNumber?: string;
  deathDate?: string;
  primaryPhone?: string;
  secondaryPhone?: string;
  whatsappPhone?: string;
  addressRegion?: string;
  addressStreet?: string;
  addressDetails?: string;
  searchType?: "DESK" | "FIELD";
  isModest?: boolean;
  officeDealings?: boolean;
  fieldNotes?: string;
  registrationDate?: string;
  alimonyStatus?: "FORMAL" | "INFORMAL_SUFFICIENT" | "INFORMAL_INSUFFICIENT" | "NONE";

  // Existing fields
  governorate?: string;
  district?: string;
  village?: string;
  address?: string;
  housingType?: string;
  hasRationCard?: boolean;
  hasFamilySupport?: boolean;
  hasFoodAid?: boolean;
  bankAssetGrade?: string | null;
  notes?: string;
  head?: WizardPersonForm;
  members?: WizardPersonForm[];
  burdens?: {
    hasDebt?: boolean;
    debtGrade?: string;
    hasInjury?: boolean;
    injuryGrade?: string;
    hasSurgery?: boolean;
    surgeryGrade?: string;
    hasSonInPrison?: boolean;
    sonInPrisonUnmarried?: boolean;
    hasSmoking?: boolean;
    hasDrugs?: boolean;
    hasBegging?: boolean;
  };
  diseases?: Array<{
    id?: string;
    _localKey?: string;
    personId?: string;
    name?: string;
    treatmentCost?: string;
    followup?: string;
    workImpact?: string;
  }>;
  disabilities?: Array<{
    id?: string;
    _localKey?: string;
    personId?: string;
    description?: string;
    workImpact?: string;
    companion?: string;
    treatmentCost?: string;
  }>;
  income?: Record<string, { amount: number; verified: string; note?: string; id?: string }>;
}

export interface ConditionalFlags {
  headIsAbsent: boolean;
  absenceReason: "death" | "divorce" | "prison" | "other" | null;
  hasWidow: boolean;
  hasDivorce: boolean;
  hasPrison: boolean;
  hasDisease: boolean;
  hasDisability: boolean;
  hasDebt: boolean;
  hasInjury: boolean;
  hasSurgery: boolean;
  hasBride: boolean;
  hasSonInPrison: boolean;
}

function deriveFlags(form: WizardFormData): ConditionalFlags {
  const head = form.head;
  const reason = head?.residencyStatus ?? null;
  const absent = reason !== "RESIDENT" && reason !== null;
  
  let mappedReason: "death" | "divorce" | "prison" | "other" | null = null;
  if (reason === "ABSENT_DEATH") mappedReason = "death";
  else if (reason === "ABSENT_DIVORCE") mappedReason = "divorce";
  else if (reason === "ABSENT_PRISON") mappedReason = "prison";
  else if (absent) mappedReason = "other";

  const members = form.members ?? [];
  return {
    headIsAbsent: absent,
    absenceReason: mappedReason,
    hasWidow: mappedReason === "death",
    hasDivorce: mappedReason === "divorce",
    hasPrison: mappedReason === "prison",
    hasDisease: members.some((m) => m.hasDisease) || Boolean(head?.hasDisease),
    hasDisability: members.some((m) => m.hasDisability) || Boolean(head?.hasDisability),
    hasDebt: Boolean(form.burdens?.hasDebt),
    hasInjury: Boolean(form.burdens?.hasInjury),
    hasSurgery: Boolean(form.burdens?.hasSurgery),
    hasBride: members.some((m) => m.isBride),
    hasSonInPrison: Boolean(form.burdens?.hasSonInPrison),
  };
}

interface WizardState {
  householdId: string | null;
  activeTab: 1 | 2 | 3 | 4 | 5;
  formData: WizardFormData;
  isDirty: boolean;
  autosaveStatus: AutosaveStatus;
  lastSavedAt: Date | null;
  conditionalFlags: ConditionalFlags;
  setHouseholdId: (id: string | null) => void;
  setField: (path: string, value: unknown) => void;
  setFormData: (data: WizardFormData) => void;
  setActiveTab: (tab: 1 | 2 | 3 | 4 | 5) => void;
  autoSave: () => Promise<void>;
  resetWizard: () => void;
  loadFromHousehold: (h: HouseholdDto) => void;
}

const initialForm: WizardFormData = {
  housingType: "OWNED",
  hasRationCard: true,
  hasFamilySupport: false,
  hasFoodAid: false,
  head: { residencyStatus: "RESIDENT", role: "HEAD", isHead: true, gender: "MALE" },
  members: [],
  burdens: {},
  income: {},
};

function setNested(obj: WizardFormData, path: string, value: unknown): WizardFormData {
  const next = { ...obj };
  const parts = path.split(".");
  let cur: Record<string, unknown> = next as Record<string, unknown>;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    cur[key] = { ...(cur[key] as Record<string, unknown>) };
    cur = cur[key] as Record<string, unknown>;
  }
  cur[parts[parts.length - 1]] = value;
  return next;
}

export const useWizardStore = create<WizardState>((set, get) => ({
  householdId: null,
  activeTab: 1,
  formData: initialForm,
  isDirty: false,
  autosaveStatus: "idle",
  lastSavedAt: null,
  conditionalFlags: deriveFlags(initialForm),

  setHouseholdId: (id) => set({ householdId: id }),

  setField: (path, value) => {
    const formData = setNested(get().formData, path, value);
    set({
      formData,
      isDirty: true,
      conditionalFlags: deriveFlags(formData),
    });
  },

  setFormData: (data) =>
    set({
      formData: data,
      isDirty: true,
      conditionalFlags: deriveFlags(data),
    }),

  setActiveTab: (tab) => set({ activeTab: tab }),

  autoSave: async () => {
    const { householdId, formData, isDirty } = get();
    if (!isDirty) return;

    set({ autosaveStatus: "saving" });
    try {
      const payload = {
        governorate: formData.governorate,
        district: formData.district,
        village: formData.village,
        address: formData.address,
        housingType: formData.housingType,
        hasRationCard: formData.hasRationCard,
        hasFamilySupport: formData.hasFamilySupport,
        hasFoodAid: formData.hasFoodAid,
        bankAssetGrade: formData.bankAssetGrade,
        notes: formData.notes,
        isDraft: true,
      };

      let id = householdId;
      if (!id) {
        if (!formData.governorate || !formData.district || !formData.village) {
          set({ autosaveStatus: "idle" });
          return;
        }
        const created = await createHousehold(payload);
        id = created.id;
        set({ householdId: id });
      } else {
        await updateHousehold(id, payload);
      }

      set({
        isDirty: false,
        autosaveStatus: "synced",
        lastSavedAt: new Date(),
      });

      if (id) {
        await useScoringStore.getState().fetchLatest(id);
      }
    } catch {
      set({ autosaveStatus: "error" });
    }
  },

  resetWizard: () =>
    set({
      householdId: null,
      activeTab: 1,
      formData: initialForm,
      isDirty: false,
      autosaveStatus: "idle",
      lastSavedAt: null,
      conditionalFlags: deriveFlags(initialForm),
    }),

  loadFromHousehold: (h) => {
    const head = h.persons?.find((p) => p.isHead) ?? h.persons?.[0];
    const members = (h.persons ?? []).filter((p) => !p.isHead);
    const income: WizardFormData["income"] = {};
    for (const src of h.incomeSources ?? []) {
      income[src.channel] = {
        amount: parseFloat(src.monthlyAmount) || 0,
        verified: src.verified,
        note: src.verificationNote ?? undefined,
        id: src.id,
      };
    }
    const formData: WizardFormData = {
      governorate: h.governorate,
      district: h.district,
      village: h.village,
      address: h.address ?? undefined,
      housingType: h.housingType,
      hasRationCard: h.hasRationCard,
      hasFamilySupport: h.hasFamilySupport,
      hasFoodAid: h.hasFoodAid,
      bankAssetGrade: h.bankAssetGrade,
      notes: h.notes ?? undefined,
      head: head ? { ...head, hasDisease: (head.diseases?.length ?? 0) > 0, hasDisability: (head.disabilities?.length ?? 0) > 0 } : initialForm.head,
      members: members.map((m) => ({
        ...m,
        hasDisease: (m.diseases?.length ?? 0) > 0,
        hasDisability: (m.disabilities?.length ?? 0) > 0,
      })),
      income,
    };
    set({
      householdId: h.id,
      formData,
      isDirty: false,
      conditionalFlags: deriveFlags(formData),
    });
  },
}));
