import { api } from "./client";
import type { ApiResponse, PaginatedMeta } from "@/lib/types/api";

export interface EducationRecordDto {
  id: string;
  academicYear: string;
  isRepeating: boolean;
  needsLevelUpdate: boolean;
  studentLevel: string;
  isSpecialEducation: boolean;
  gradeYear: number | null;
  schoolName: string | null;
  gradeInputType: string;
  subjects: Array<{ name: string; letterGrade?: string; score?: number; maxScore?: number }>;
  averageScore: number | null;
  overallGrade: string | null;
  quranJuzCount: number | null;
  quranProgress: number | null;
  quranLastSurah: string | null;
  quranTeacher: string | null;
  quranInstitute: string | null;
  quranCustomInstitute?: string | null;
  quranGrade?: number | null;
  quranAttendancePercent?: number | null;
  quranOverallScore?: number | null;
  totalScore: number | null;
  notes: string | null;
  updatedAt: string;
  person: {
    id: string;
    name: string;
    nationalId: string | null;
    gender: string;
    birthDate: string;
    age: number | null;
  };
  household: {
    id: string;
    code: string;
    primaryPhone: string | null;
    whatsappPhone: string | null;
    headName: string | null;
    classificationTag: string | null;
  };
}

export interface EducationKpis {
  totalStudents: number;
  excellentCount: number;
  failingCount: number;
  avgTotalScore: number;
  quranStudentsCount: number;
  needsUpdateCount: number;
  levelBreakdown: Record<string, number>;
  classificationBreakdown: Record<string, number>;
}

export async function listEducationRecords(params?: Record<string, string | number | boolean | undefined>) {
  const { data } = await api.get<ApiResponse<EducationRecordDto[]> & { meta: PaginatedMeta }>("/education", { params });
  return { data: data.data ?? [], meta: data.meta };
}

export async function getEducationKpis(params?: Record<string, string | number | boolean | undefined>) {
  const { data } = await api.get<ApiResponse<EducationKpis>>("/education/kpis", { params });
  return data.data!;
}

export async function getEducationRecord(id: string) {
  const { data } = await api.get<ApiResponse<EducationRecordDto>>(`/education/${id}`);
  return data.data!;
}

export async function createEducationRecord(body: Record<string, unknown>) {
  const { data } = await api.post<ApiResponse<EducationRecordDto>>("/education", body);
  return data.data!;
}

export async function updateEducationRecord(id: string, body: Record<string, unknown>) {
  const { data } = await api.put<ApiResponse<EducationRecordDto>>(`/education/${id}`, body);
  return data.data!;
}

export async function deleteEducationRecord(id: string) {
  await api.delete(`/education/${id}`);
}

export async function getStudentHistory(personId: string) {
  const { data } = await api.get<ApiResponse<EducationRecordDto[]>>(`/education/person/${personId}/history?t=${Date.now()}`);
  return data.data ?? [];
}

export async function lookupHouseholdForEducation(query: string) {
  const { data } = await api.get<ApiResponse<any[]>>(`/education/household-lookup`, { params: { q: query } });
  return data.data ?? [];
}
