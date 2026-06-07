import client from './client'
import type {
  MedicalCase, MedicalDisbursement, EligibilityResult, MedicalSummary
} from '../../types/medical'

// ─── Types لـ API responses ───────────────────────────────

interface PaginatedCases {
  cases: MedicalCase[]
  total: number
  page: number
  limit: number
  totalPages: number
}

interface MedicalKpis {
  totalCases: number
  criticalCases: number
  monthlyEstimate: number
}

interface CreateDisbursementResponse {
  disbursement: MedicalDisbursement
  eligibilityResult: EligibilityResult
  amountWarning: string | null
}

// ─── Helper: تحويل Decimal string → number ───────────────
// Prisma يرجع Decimal كـ string — نحوّلها
function parseDecimal(val: unknown): number {
  if (val === null || val === undefined) return 0
  return parseFloat(String(val)) || 0
}

function normalizeCaseFromApi(raw: Record<string, unknown>): MedicalCase {
  const latestScore = (raw.household as Record<string, unknown[]> | undefined)
    ?.scoreResults?.[0] as Record<string, unknown> | undefined

  return {
    id: raw.id as string,
    householdId: raw.householdId as string,
    personId: raw.personId as string,
    personName: (raw.person as { name: string } | undefined)?.name ?? '',
    personGender: (raw.person as { gender: string } | undefined)?.gender as 'MALE' | 'FEMALE' ?? 'MALE',
    personBirthDate: (raw.person as { birthDate: string } | undefined)?.birthDate ?? '',
    householdCode: (raw.household as { code: string } | undefined)?.code ?? '',
    headName: '',   // يُملأ من الأسرة — يمكن إضافته في الباك إند لو احتجت
    assistanceType: latestScore?.assistanceType as any,
    normalizedPercent: parseDecimal(latestScore?.normalizedPercent),
    conditionName: raw.conditionName as string,
    isCritical: raw.isCritical as boolean,
    isActive: raw.isActive as boolean,
    estimatedMonthlyCost: raw.estimatedMonthlyCost
      ? parseDecimal(raw.estimatedMonthlyCost)
      : undefined,
    doctorName: raw.doctorName as string | undefined,
    hospitalName: raw.hospitalName as string | undefined,
    startDate: raw.startDate as string | undefined,
    notes: raw.notes as string | undefined,
    disbursements: ((raw.disbursements as unknown[]) ?? []).map(normalizeDisbursementFromApi),
    lastDisbursementDate: (raw.disbursements as Record<string, unknown>[])?.[0]?.disbursementDate as string | undefined,
    createdAt: raw.createdAt as string,
  }
}

function normalizeDisbursementFromApi(raw: unknown): MedicalDisbursement {
  const d = raw as Record<string, unknown>
  return {
    id: d.id as string,
    householdId: d.householdId as string,
    personId: d.personId as string,
    personName: (d.person as { name: string } | undefined)?.name ?? '',
    medicalCaseId: d.medicalCaseId as string | undefined,
    aidType: d.aidType as MedicalDisbursement['aidType'],
    amount: parseDecimal(d.amount),
    totalCost: d.totalCost ? parseDecimal(d.totalCost) : undefined,
    coveragePercent: d.coveragePercent ? parseDecimal(d.coveragePercent) : undefined,
    isCriticalOverride: d.isCriticalOverride as boolean,
    isRetroactive: d.isRetroactive as boolean,
    disbursementDate: d.disbursementDate as string,
    status: d.status as MedicalDisbursement['status'],
    approvedByName: (d.approvedBy as { name: string } | undefined)?.name,
    notes: d.notes as string | undefined,
    createdAt: d.createdAt as string,
  }
}

// ─── API Functions ────────────────────────────────────────

export const medicalApi = {

  // KPIs
  async getKpis(): Promise<MedicalKpis> {
    const res = await client.get('/medical-cases/kpis')
    return res.data.data
  },

  // List cases
  async listCases(params?: {
    search?: string
    criticalOnly?: boolean
    isActive?: boolean
    page?: number
    limit?: number
  }): Promise<PaginatedCases> {
    const res = await client.get('/medical-cases', { params })
    return {
      ...res.data.data,
      cases: res.data.data.cases.map(normalizeCaseFromApi),
    }
  },

  // Get case by ID
  async getCaseById(id: string): Promise<MedicalCase> {
    const res = await client.get(`/medical-cases/${id}`)
    return normalizeCaseFromApi(res.data.data)
  },

  // Get cases by household
  async getCasesByHousehold(householdId: string): Promise<MedicalCase[]> {
    const res = await client.get(`/medical-cases/household/${householdId}`)
    return res.data.data.map(normalizeCaseFromApi)
  },

  // Create case
  async createCase(data: Partial<MedicalCase>): Promise<MedicalCase> {
    const res = await client.post('/medical-cases', data)
    return normalizeCaseFromApi(res.data.data)
  },

  // Update case
  async updateCase(id: string, data: Partial<MedicalCase>): Promise<MedicalCase> {
    const res = await client.put(`/medical-cases/${id}`, data)
    return normalizeCaseFromApi(res.data.data)
  },

  // Delete case
  async deleteCase(id: string): Promise<void> {
    await client.delete(`/medical-cases/${id}`)
  },

  // Check eligibility
  async checkEligibility(
    householdId: string,
    aidType: string,
    personId?: string
  ): Promise<EligibilityResult> {
    const res = await client.get(`/medical-cases/eligibility/${householdId}`, {
      params: { aidType, personId }
    })
    const d = res.data.data
    return {
      ...d,
      appliedCap: d.appliedCap ? parseDecimal(d.appliedCap) : null,
      normalizedPercent: d.normalizedPercent ? parseDecimal(d.normalizedPercent) : null,
    }
  },

  // Create disbursement
  async createDisbursement(data: {
    householdId: string
    personId: string
    medicalCaseId?: string
    aidType: string
    amount: number
    totalCost?: number
    coveragePercent?: number
    isCritical?: boolean
    isRetroactive?: boolean
    disbursementDate?: string
    notes?: string
  }): Promise<CreateDisbursementResponse> {
    const res = await client.post('/medical-disbursements', data)
    return {
      disbursement: normalizeDisbursementFromApi(res.data.data.disbursement),
      eligibilityResult: res.data.data.eligibilityResult,
      amountWarning: res.data.data.amountWarning,
    }
  },

  // Get disbursements by household
  async getDisbursementsByHousehold(householdId: string): Promise<MedicalDisbursement[]> {
    const res = await client.get(`/medical-disbursements/household/${householdId}`)
    return res.data.data.map(normalizeDisbursementFromApi)
  },

  // Approve disbursement
  async approveDisbursement(id: string): Promise<MedicalDisbursement> {
    const res = await client.patch(`/medical-disbursements/${id}/approve`)
    return normalizeDisbursementFromApi(res.data.data)
  },

  // Pay disbursement
  async payDisbursement(id: string): Promise<MedicalDisbursement> {
    const res = await client.patch(`/medical-disbursements/${id}/pay`)
    return normalizeDisbursementFromApi(res.data.data)
  },

  // Reject disbursement
  async rejectDisbursement(id: string): Promise<MedicalDisbursement> {
    const res = await client.patch(`/medical-disbursements/${id}/reject`)
    return normalizeDisbursementFromApi(res.data.data)
  },

  // Medical summary (for evaluation tab)
  async getMedicalSummary(householdId: string): Promise<MedicalSummary> {
    const res = await client.get(`/medical-cases/summary/${householdId}`)
    const d = res.data.data
    // تحويل الأرقام من Prisma Decimal
    return {
      counts: d.counts,
      amounts: Object.fromEntries(
        Object.entries(d.amounts).map(([k, v]) => [k, parseDecimal(v)])
      ) as MedicalSummary['amounts'],
      hasUnverifiedDisbursements: d.hasUnverifiedDisbursements,
      lastDisbursementDate: d.lastDisbursementDate,
    }
  },
}
