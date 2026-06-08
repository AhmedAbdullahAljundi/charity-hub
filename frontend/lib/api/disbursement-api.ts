// frontend/lib/api/disbursement-api.ts
// All disbursement API calls — follows the same pattern as education-api.ts

import { api } from './client'
import type { ApiResponse } from '@/lib/types/api'
import type {
  DisbursementMonth,
  MonthlyPayment,
  CategoryConfig,
  GrantConfig,
  SimulateResult,
} from '@/lib/disbursement/types'

// ─── Months ──────────────────────────────────────────────────────────────────

export async function listMonths(params?: Record<string, string | number | undefined>) {
  const { data } = await api.get<ApiResponse<{ months: DisbursementMonth[]; total: number }>>(
    '/disbursement',
    { params },
  )
  return { months: data.data?.months ?? [], total: data.data?.total ?? 0 }
}

export async function getMonth(monthId: string) {
  const { data } = await api.get<ApiResponse<DisbursementMonth>>(`/disbursement/${monthId}`)
  return data.data!
}

export async function openMonth(body: {
  period: string
  method: string
  totalBudget?: number
  notes?: string
}) {
  const { data } = await api.post<ApiResponse<DisbursementMonth>>('/disbursement', body)
  return data.data!
}

export async function calculateMonth(monthId: string) {
  const { data } = await api.post<ApiResponse<{ processed: number; skipped: number }>>(
    `/disbursement/${monthId}/calculate`,
  )
  return data.data!
}

export async function approveMonth(monthId: string, notes?: string) {
  const { data } = await api.patch<ApiResponse<{ status: string }>>(
    `/disbursement/${monthId}/approve`,
    { notes },
  )
  return data.data!
}

export async function reopenMonth(monthId: string, reopenReason: string) {
  const { data } = await api.patch<ApiResponse<{ status: string }>>(
    `/disbursement/${monthId}/reopen`,
    { reopenReason },
  )
  return data.data!
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export async function adjustPayment(
  monthId: string,
  paymentId: string,
  body: { manualAdjustment: number; adjustmentReason: string; fundSource?: string },
) {
  const { data } = await api.patch<ApiResponse<MonthlyPayment>>(
    `/disbursement/${monthId}/payments/${paymentId}/adjust`,
    body,
  )
  return data.data!
}

export async function updatePaymentStatus(
  monthId: string,
  paymentId: string,
  body: { meezaStatus?: string; cashStatus?: string },
) {
  const { data } = await api.patch<ApiResponse<MonthlyPayment>>(
    `/disbursement/${monthId}/payments/${paymentId}/status`,
    body,
  )
  return data.data!
}

export async function addPayment(monthId: string, householdId: string) {
  const { data } = await api.post<ApiResponse<MonthlyPayment>>(
    `/disbursement/${monthId}/payments`,
    { householdId },
  )
  return data.data!
}

export async function removePayment(monthId: string, paymentId: string) {
  const { data } = await api.delete<ApiResponse<{ success: boolean }>>(
    `/disbursement/${monthId}/payments/${paymentId}`,
  )
  return data.success
}

// ─── Simulate ─────────────────────────────────────────────────────────────────

export async function simulateMonth(body: { method: string; totalBudget?: number }) {
  const { data } = await api.post<ApiResponse<SimulateResult>>('/disbursement/simulate', body)
  return data.data!
}

// ─── External contributions ───────────────────────────────────────────────────

export async function addExternalContribution(body: {
  householdId: string
  period: string
  institutionName: string
  amount: number
  confirmed?: boolean
  notes?: string
}) {
  const { data } = await api.post('/disbursement/contributions', body)
  return data.data
}

// ─── Config ───────────────────────────────────────────────────────────────────

export async function getCategoryConfigs() {
  const { data } = await api.get<ApiResponse<CategoryConfig[]>>('/disbursement/config/categories')
  return data.data ?? []
}

export async function updateCategoryConfig(code: string, body: Partial<CategoryConfig>) {
  const { data } = await api.put<ApiResponse<CategoryConfig>>(
    `/disbursement/config/categories/${code}`,
    body,
  )
  return data.data!
}

export async function getGrantConfigs() {
  const { data } = await api.get<ApiResponse<GrantConfig[]>>('/disbursement/config/grants')
  return data.data ?? []
}

export async function updateGrantConfig(code: string, body: Partial<GrantConfig>) {
  const { data } = await api.put<ApiResponse<GrantConfig>>(
    `/disbursement/config/grants/${code}`,
    body,
  )
  return data.data!
}

// ─── Export ───────────────────────────────────────────────────────────────────

export function getMeezaExportUrl(monthId: string): string {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
  return `${base}/disbursement/${monthId}/export/meeza`
}
