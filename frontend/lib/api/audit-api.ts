import { api } from "./client";
import type { ApiResponse } from "@/lib/types/api";

export async function getAuditLogs(params?: Record<string, any>) {
  const { data } = await api.get<ApiResponse<{ data: any[]; total: number }>>("/audit-logs", { params });
  return data.data; // Note: if backend is /audit we might need to adjust
}
