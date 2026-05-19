import { api } from "./client";
import type { ApiResponse, HouseholdDto, PaginatedMeta, PersonDto, IncomeSourceDto } from "@/lib/types/api";

export async function listHouseholds(params?: Record<string, string | number | boolean | undefined>) {
  const { data } = await api.get<ApiResponse<HouseholdDto[]> & { meta: PaginatedMeta }>("/households", {
    params,
  });
  return { data: data.data ?? [], meta: data.meta };
}

export async function getHousehold(id: string) {
  const { data } = await api.get<ApiResponse<HouseholdDto>>(`/households/${id}`);
  return data.data!;
}

export async function createHousehold(body: Record<string, unknown>) {
  const { data } = await api.post<ApiResponse<HouseholdDto>>("/households", body);
  return data.data!;
}

export async function updateHousehold(id: string, body: Record<string, unknown>) {
  const { data } = await api.put<ApiResponse<HouseholdDto>>(`/households/${id}`, body);
  return data.data!;
}

export async function deleteHousehold(id: string) {
  await api.delete(`/households/${id}`);
}

export async function publishHousehold(id: string) {
  const { data } = await api.patch<ApiResponse<HouseholdDto>>(`/households/${id}/publish`);
  return data.data!;
}

export async function createPerson(householdId: string, body: Record<string, unknown>) {
  const { data } = await api.post<ApiResponse<PersonDto>>(`/households/${householdId}/persons`, body);
  return data.data!;
}

export async function updatePerson(householdId: string, pid: string, body: Record<string, unknown>) {
  const { data } = await api.put<ApiResponse<PersonDto>>(`/households/${householdId}/persons/${pid}`, body);
  return data.data!;
}

export async function deletePerson(householdId: string, pid: string) {
  await api.delete(`/households/${householdId}/persons/${pid}`);
}

export async function createDisease(householdId: string, pid: string, body: Record<string, unknown>) {
  const { data } = await api.post(`/households/${householdId}/persons/${pid}/diseases`, body);
  return data.data;
}

export async function updateDisease(
  householdId: string,
  pid: string,
  did: string,
  body: Record<string, unknown>
) {
  const { data } = await api.put(`/households/${householdId}/persons/${pid}/diseases/${did}`, body);
  return data.data;
}

export async function deleteDisease(householdId: string, pid: string, did: string) {
  await api.delete(`/households/${householdId}/persons/${pid}/diseases/${did}`);
}

export async function createDisability(householdId: string, pid: string, body: Record<string, unknown>) {
  const { data } = await api.post(`/households/${householdId}/persons/${pid}/disabilities`, body);
  return data.data;
}

export async function updateDisability(
  householdId: string,
  pid: string,
  diid: string,
  body: Record<string, unknown>
) {
  const { data } = await api.put(`/households/${householdId}/persons/${pid}/disabilities/${diid}`, body);
  return data.data;
}

export async function deleteDisability(householdId: string, pid: string, diid: string) {
  await api.delete(`/households/${householdId}/persons/${pid}/disabilities/${diid}`);
}

export async function createIncome(householdId: string, body: Record<string, unknown>) {
  const { data } = await api.post<ApiResponse<IncomeSourceDto>>(`/households/${householdId}/income`, body);
  return data.data!;
}

export async function updateIncome(householdId: string, iid: string, body: Record<string, unknown>) {
  const { data } = await api.put<ApiResponse<IncomeSourceDto>>(`/households/${householdId}/income/${iid}`, body);
  return data.data!;
}

export async function verifyIncome(householdId: string, iid: string, body: Record<string, unknown>) {
  const { data } = await api.patch<ApiResponse<IncomeSourceDto>>(
    `/households/${householdId}/income/${iid}/verify`,
    body
  );
  return data.data!;
}
