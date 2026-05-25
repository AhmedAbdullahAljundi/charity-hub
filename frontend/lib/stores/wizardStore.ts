"use client";

import { create } from "zustand";
import { updateHousehold, createHousehold, createPerson, updatePerson } from "@/lib/api/households-api";
import { useScoringStore } from "./scoringStore";
import type { HouseholdDto, PersonDto } from "@/lib/types/api";
import { toast } from "sonner";

export type AutosaveStatus = "idle" | "saving" | "synced" | "error";

export interface WizardPersonForm extends Partial<PersonDto> {
  _localKey?: string;
  personId?: string;
  nationalId?: string;
  relationship?: string;
  notes?: string;
  hasDisease?: boolean;
  hasDisability?: boolean;
  diseasesDraft?: Array<Partial<{ id?: string; treatmentCost: string; followup: string; workImpact: string }>>;
  disabilitiesDraft?: Array<Partial<{ id?: string; workImpact: string; companion: string; treatmentCost: string }>>;
  workCorrection?: { type: string; multiplier: number; educationMultiplier?: number };
}

export interface WizardFormData {
  code?: string;
  familyName?: string;
  wifeName?: string;
  wifeNationalId?: string;
  wifeEmploymentQuality?: string;
  wifeEducationLevel?: string;
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
  workCorrection?: { type: string; multiplier: number };
  pdfUrl?: string;
  pastSpouses?: Array<{ name: string; nationalId?: string }>;

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
    debtId?: string;
    hasInjury?: boolean;
    injuryGrade?: string;
    injuryId?: string;
    hasSurgery?: boolean;
    surgeryGrade?: string;
    surgeryId?: string;
    hasSonInPrison?: boolean;
    sonInPrisonUnmarried?: boolean;
    sonInPrisonGrade?: string;
    sonInPrisonId?: string;
    // Removed: social indicators had no backend implementation
  };
  income?: Record<string, { amount: number; verified?: boolean; note?: string; id?: string }>;
  diseases?: Array<any>;
  disabilities?: Array<any>;
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
  const socialStatusDivorce = form.socialStatus === "DIVORCED" || form.socialStatus === "مطلقة" || form.socialStatus === "DIVORCE" as any;

  return {
    headIsAbsent: absent,
    absenceReason: mappedReason,
    hasWidow: mappedReason === "death",
    hasDivorce: mappedReason === "divorce" || socialStatusDivorce,
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
  workCorrection: { type: "", multiplier: 0 },
  head: { residencyStatus: "RESIDENT", role: "HEAD", isHead: true, gender: "MALE" },
  members: [],
  burdens: {},
  income: {},
};

function extractNationalIdInfo(nationalId?: string) {
  if (!nationalId || !/^([23])(\d{2})(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{7}$/.test(nationalId)) return null;
  const century = nationalId[0] === "2" ? 1900 : 2000;
  const year = century + Number(nationalId.substring(1, 3));
  const month = Number(nationalId.substring(3, 5));
  const day = Number(nationalId.substring(5, 7));
  const genderDigit = Number(nationalId.substring(12, 13));
  return {
    gender: genderDigit % 2 === 0 ? "FEMALE" : "MALE",
    birthDate: new Date(Date.UTC(year, month - 1, day)).toISOString().split("T")[0],
  };
}

function buildHeadPayload(formData: WizardFormData) {
  const head = formData.head;
  if (!head?.name) return null;
  const nationalIdInfo = extractNationalIdInfo(head.nationalId);
  const maritalStatus = formData.socialStatus === "SINGLE_OTHER" ? "SINGLE" : formData.socialStatus || "MARRIED";
  const payload: Record<string, unknown> = {
    name: head.name,
    nationalId: head.nationalId,
    gender: head.gender || nationalIdInfo?.gender || "MALE",
    birthDate: head.birthDate || nationalIdInfo?.birthDate,
    role: "HEAD",
    isHead: true,
    residencyStatus: head.residencyStatus,
    employmentType: head.employmentType || "NONE",
    educationLevel: head.educationLevel || "ILLITERATE",
    maritalStatus,
  };
  return payload;
}

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
        code: formData.code,
        familyName: formData.familyName || (formData.wifeName ? `أسرة ${formData.wifeName}` : undefined),
        wifeName: formData.wifeName,
        wifeNationalId: formData.wifeNationalId,
        governorate: formData.governorate || formData.addressRegion || "1",
        district: formData.district || "default",
        village: formData.village || "default",
        address: formData.address,
        addressRegion: formData.addressRegion,
        addressStreet: formData.addressStreet,
        addressDetails: formData.addressDetails,
        housingType: formData.housingType,
        hasRationCard: formData.hasRationCard,
        hasFamilySupport: formData.hasFamilySupport,
        hasFoodAid: formData.hasFoodAid,
        bankAssetGrade: formData.bankAssetGrade,
        primaryPhone: formData.primaryPhone,
        secondaryPhone: formData.secondaryPhone,
        whatsappPhone: formData.whatsappPhone,
        socialStatus: formData.socialStatus,
        divorceYear: formData.divorceYear,
        divorceDocNumber: formData.divorceDocNumber,
        marriageCount: formData.marriageCount,
        deathCertNumber: formData.deathCertNumber,
        deathDate: formData.deathDate,
        registrationDate: formData.registrationDate,
        searchType: formData.searchType,
        isModest: formData.isModest,
        officeDealings: formData.officeDealings,
        notes: formData.notes,
        fieldNotes: formData.fieldNotes,
        pdfUrl: formData.pdfUrl,
        pastSpouses: formData.pastSpouses,
        isDraft: true,
      };

      let id = householdId;
      if (!id) {
        if (!formData.code && !formData.wifeName) {
          set({ autosaveStatus: "idle" });
          return;
        }
        const created = await createHousehold(payload);
        id = created.id;
        set({ householdId: id });
      } else {
        await updateHousehold(id, payload);
      }

      const headPayload = buildHeadPayload(formData);
      // attach work correction if present
      if (headPayload && formData.workCorrection) {
        headPayload.workCorrection = formData.workCorrection;
      }
      if (id && headPayload?.birthDate) {
        const headId = formData.head?.personId || formData.head?.id;
        const savedHead = headId
          ? await updatePerson(id, headId, headPayload)
          : await createPerson(id, headPayload);
        const nextFormData = {
          ...get().formData,
          head: { ...get().formData.head, ...savedHead, personId: savedHead.id },
        };
        set({
          formData: nextFormData,
          conditionalFlags: deriveFlags(nextFormData),
        });
      }

      if (id && formData.socialStatus === "DIVORCED") {
        const spouse = formData.members?.find((m) => m.role === "SPOUSE");
        if (spouse && (spouse.personId || spouse.id)) {
          const sId = spouse.personId || spouse.id;
          await updatePerson(id, sId, { alimonyStatus: formData.alimonyStatus || null });
          const nextMembers = formData.members?.map(m => m.role === "SPOUSE" ? { ...m, alimonyStatus: formData.alimonyStatus || null } : m) || [];
          set({ formData: { ...get().formData, members: nextMembers } });
        }
      }

      set({
        isDirty: false,
        autosaveStatus: "synced",
        lastSavedAt: new Date(),
      });

      if (id) {
        await useScoringStore.getState().fetchLatest(id);
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || String(e);
      if (msg.includes('nationalId') || msg.includes('National ID') || msg.includes('الرقم القومي')) {
        toast.error("الرقم القومي المدخل مسجل مسبقاً في النظام. يرجى المراجعة.");
      } else if (msg.includes('Household code already exists') || msg.includes('Unique constraint')) {
        toast.error("رقم القيد أو الرقم القومي المدخل مسجل مسبقاً لأسرة أخرى. يرجى المراجعة.");
      } else {
        toast.error(`تعذر الحفظ: ${msg}`);
      }
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
      code: h.code,
      governorate: h.governorate,
      district: h.district,
      village: h.village,
      address: h.address ?? undefined,
      addressRegion: h.addressRegion ?? undefined,
      addressStreet: h.addressStreet ?? undefined,
      addressDetails: h.addressDetails ?? undefined,
      housingType: h.housingType,
      hasRationCard: h.hasRationCard,
      hasFamilySupport: h.hasFamilySupport,
      hasFoodAid: h.hasFoodAid,
      bankAssetGrade: h.bankAssetGrade,
      primaryPhone: h.primaryPhone ?? undefined,
      secondaryPhone: h.secondaryPhone ?? undefined,
      whatsappPhone: h.whatsappPhone ?? undefined,
      socialStatus: h.socialStatus ?? undefined,
      divorceYear: h.divorceYear ?? undefined,
      divorceDocNumber: h.divorceDocNumber ?? undefined,
      marriageCount: h.marriageCount ?? undefined,
      deathCertNumber: h.deathCertNumber ?? undefined,
      deathDate: h.deathDate ?? undefined,
      registrationDate: h.registrationDate ?? undefined,
      searchType: h.searchType ?? undefined,
      isModest: h.isModest ?? undefined,
      officeDealings: h.officeDealings ?? undefined,
      notes: h.notes ?? undefined,
      fieldNotes: h.fieldNotes ?? undefined,
      pdfUrl: h.pdfUrl ?? undefined,
      pastSpouses: h.pastSpouses ? (h.pastSpouses as any) : undefined,
      head: head ? { ...head, personId: head.id, hasDisease: (head.diseases?.length ?? 0) > 0, hasDisability: (head.disabilities?.length ?? 0) > 0 } : initialForm.head,
      members: members.map((m) => ({
        ...m,
        hasDisease: (m.diseases?.length ?? 0) > 0,
        hasDisability: (m.disabilities?.length ?? 0) > 0,
      })),
      diseases: (head?.diseases ?? []).map((d) => ({
        ...d,
        personId: head.id,
      })),
      disabilities: (head?.disabilities ?? []).map((d) => ({
        ...d,
        personId: head.id,
      })),
      burdens: {
        ...(h.temporaryBurdens ?? []).reduce<NonNullable<WizardFormData["burdens"]>>((acc, burden) => {
          if (burden.type === "DEBT") {
            acc.hasDebt = true;
            acc.debtGrade = burden.grade ?? undefined;
            acc.debtId = burden.id;
          } else if (burden.type === "INJURY") {
            acc.hasInjury = true;
            acc.injuryGrade = burden.grade ?? undefined;
            acc.injuryId = burden.id;
          } else if (burden.type === "SURGERY") {
            acc.hasSurgery = true;
            acc.surgeryGrade = burden.grade ?? undefined;
            acc.surgeryId = burden.id;
          } else if (burden.type === "SON_IN_PRISON") {
            acc.hasSonInPrison = true;
            acc.sonInPrisonGrade = burden.grade ?? undefined;
            acc.sonInPrisonId = burden.id;
          }
          return acc;
        }, {}),
      },
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
