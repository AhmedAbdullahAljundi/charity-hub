import { api } from "./client";
import type { ApiResponse, ScoreResultDto, SimulationResult } from "@/lib/types/api";

export async function calculateScore(householdId: string) {
  const { data } = await api.post<ApiResponse<ScoreResultDto>>(`/households/${householdId}/calculate`);
  return data.data!;
}

export async function getScoreHistory(householdId: string) {
  const { data } = await api.get<ApiResponse<ScoreResultDto[]>>(`/households/${householdId}/score-history`);
  return data.data ?? [];
}

export async function getLatestScore(householdId: string) {
  const { data } = await api.get<ApiResponse<ScoreResultDto>>(`/households/${householdId}/score-latest`);
  return data.data!;
}

export async function decideScore(householdId: string, body: Record<string, unknown>) {
  const { data } = await api.patch<ApiResponse<ScoreResultDto>>(
    `/households/${householdId}/score-latest/decide`,
    body
  );
  return data.data!;
}

export async function simulateWhatIf(body: { householdId: string; modifications: Array<{ field: string; value: unknown }> }) {
  const { data } = await api.post<ApiResponse<SimulationResult>>("/simulate", body);
  return data.data!;
}
