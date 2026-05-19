import { api } from "./client";
import type { ApiResponse } from "@/lib/types/api";

export async function getRules() {
  const { data } = await api.get<ApiResponse<any[]>>("/admin/rules");
  return data.data ?? [];
}

export async function simulateRule(ruleId: string, value: number) {
  const { data } = await api.post<ApiResponse<any>>(`/admin/rules/${ruleId}/simulate`, { value });
  return data.data;
}

export async function overrideRule(ruleId: string, payload: { value: number; reason: string; expiresAt?: string }) {
  const { data } = await api.put<ApiResponse<any>>(`/admin/rules/${ruleId}`, payload);
  return data.data;
}

export async function revertRule(ruleId: string) {
  const { data } = await api.delete<ApiResponse<any>>(`/admin/rules/${ruleId}/override`);
  return data.data;
}
