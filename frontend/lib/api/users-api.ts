import { api } from "./client";
import type { ApiResponse } from "@/lib/types/api";

export interface UserDto {
  id: string;
  name: string;
  nameAr?: string;
  email: string;
  role: string;
  active: boolean;
  preferredLocale?: string;
  customPermissions?: string[];
  mustChangePassword?: boolean;
  passwordResetRequest?: boolean;
  passwordResetAt?: string | null;
  lastLoginAt?: string | null;
  assignedGovernorate?: string | null;
  assignedDistrict?: string | null;
  effectivePermissions?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface UsersListResponse {
  users: UserDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function listUsersApi(params: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
} = {}): Promise<UsersListResponse> {
  const { data } = await api.get<ApiResponse<UsersListResponse>>("/users", { params });
  return data.data!;
}

export async function getUserApi(id: string): Promise<UserDto> {
  const { data } = await api.get<ApiResponse<UserDto>>(`/users/${id}`);
  return data.data!;
}

export async function createUserApi(payload: {
  name: string;
  email: string;
  password: string;
  role: string;
  governorate?: string;
  district?: string;
  preferredLocale?: string;
}): Promise<UserDto> {
  const { data } = await api.post<ApiResponse<UserDto>>("/users", payload);
  return data.data!;
}

export async function updateUserApi(id: string, payload: Partial<UserDto>): Promise<UserDto> {
  const { data } = await api.put<ApiResponse<UserDto>>(`/users/${id}`, payload);
  return data.data!;
}

export async function changeRoleApi(id: string, role: string): Promise<void> {
  await api.patch(`/users/${id}/role`, { role });
}

export async function setPermissionsApi(id: string, customPermissions: string[]): Promise<UserDto> {
  const { data } = await api.patch<ApiResponse<UserDto>>(`/users/${id}/permissions`, { customPermissions });
  return data.data!;
}

export async function setTempPasswordApi(id: string, tempPassword: string): Promise<void> {
  await api.patch(`/users/${id}/set-temp-password`, { tempPassword });
}

export async function deactivateUserApi(id: string): Promise<void> {
  await api.delete(`/users/${id}`);
}

export async function forgotPasswordApi(email: string): Promise<void> {
  await api.post("/auth/forgot-password", { email });
}

export async function changePasswordApi(currentPassword: string, newPassword: string): Promise<void> {
  await api.post("/auth/change-password", { currentPassword, newPassword });
}
