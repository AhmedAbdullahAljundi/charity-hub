import { api } from "./client";
import type { ApiResponse } from "@/lib/types/api";

export async function getDistribution() {
  const { data } = await api.get<ApiResponse<any>>("/analytics/distribution");
  return data.data;
}

export async function getRegional() {
  const { data } = await api.get<ApiResponse<any>>("/analytics/regional");
  return data.data;
}

export async function getScoreTrends() {
  const { data } = await api.get<ApiResponse<any>>("/analytics/score-trends");
  return data.data;
}
