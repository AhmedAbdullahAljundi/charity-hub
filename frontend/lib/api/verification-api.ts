import { api } from "./client";
import type { ApiResponse } from "@/lib/types/api";

export interface VerificationStats {
  unverifiedCount: number;
  unverifiedPensionCount: number;
  totalPenaltyApplied: number;
}

export async function getVerificationStats() {
  const { data } = await api.get<ApiResponse<VerificationStats>>("/analytics/verification-stats");
  return data.data!;
}

export async function getVerificationList(params?: Record<string, string>) {
  const { data } = await api.get<ApiResponse<any[]>>("/verification", { params });
  return data.data ?? [];
}

export async function verifySingleIncome(householdId: string, incomeId: string, note?: string) {
  const { data } = await api.patch<ApiResponse<any>>(`/households/${householdId}/income/${incomeId}/verify`, { verificationNote: note, verified: "VERIFIED" });
  return data.data;
}

export async function bulkVerifyIncome(ids: string[], note?: string) {
  const { data } = await api.patch<ApiResponse<any[]>>("/verification/bulk", { ids, verificationNote: note, verified: "VERIFIED" });
  return data.data;
}
