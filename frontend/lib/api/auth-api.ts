import { api } from "./client";
import type { ApiResponse, AuthTokens, ApiUser } from "@/lib/types/api";

export async function loginApi(email: string, password: string) {
  const { data } = await api.post<ApiResponse<AuthTokens>>("/auth/login", { email, password });
  return data.data!;
}

export async function refreshApi(refreshToken: string) {
  const { data } = await api.post<ApiResponse<AuthTokens>>("/auth/refresh", { refreshToken });
  return data.data!;
}

export async function logoutApi(refreshToken?: string) {
  await api.post("/auth/logout", { refreshToken });
}

export async function meApi() {
  const { data } = await api.get<ApiResponse<ApiUser>>("/auth/me");
  return data.data!;
}
