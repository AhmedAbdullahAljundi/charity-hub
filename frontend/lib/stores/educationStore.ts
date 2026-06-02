"use client";

import { create } from "zustand";
import {
  listEducationRecords,
  getEducationRecord,
  getEducationKpis,
  createEducationRecord,
  updateEducationRecord,
  deleteEducationRecord,
} from "@/lib/api/education-api";
import type { EducationRecordDto, EducationKpis } from "@/lib/api/education-api";
import type { PaginatedMeta } from "@/lib/types/api";

interface EducationState {
  list: EducationRecordDto[];
  current: EducationRecordDto | null;
  kpis: EducationKpis | null;
  pagination: PaginatedMeta | null;
  loading: boolean;
  error: string | null;
  fetchList: (params?: Record<string, string | number | boolean | undefined>) => Promise<void>;
  fetchKpis: (params?: Record<string, string | number | boolean | undefined>) => Promise<void>;
  fetchOne: (id: string) => Promise<EducationRecordDto>;
  create: (body: Record<string, unknown>) => Promise<EducationRecordDto>;
  update: (id: string, body: Record<string, unknown>) => Promise<EducationRecordDto>;
  remove: (id: string) => Promise<void>;
  setCurrent: (r: EducationRecordDto | null) => void;
}

export const useEducationStore = create<EducationState>((set) => ({
  list: [],
  current: null,
  kpis: null,
  pagination: null,
  loading: false,
  error: null,

  fetchList: async (params) => {
    set({ loading: true, error: null });
    try {
      const { data, meta } = await listEducationRecords(params);
      set({ list: data, pagination: meta, loading: false });
    } catch (e) {
      set({ loading: false, error: (e as Error).message });
      throw e;
    }
  },

  fetchKpis: async (params) => {
    try {
      const kpis = await getEducationKpis(params);
      set({ kpis });
    } catch (e) {
      console.error("Failed to fetch KPIs", e);
    }
  },

  fetchOne: async (id) => {
    set({ loading: true, error: null });
    try {
      const r = await getEducationRecord(id);
      set({ current: r, loading: false });
      return r;
    } catch (e) {
      set({ loading: false, error: (e as Error).message });
      throw e;
    }
  },

  create: async (body) => {
    const r = await createEducationRecord(body);
    set((s) => ({ list: [r, ...s.list], current: r }));
    return r;
  },

  update: async (id, body) => {
    const r = await updateEducationRecord(id, body);
    set((s) => ({
      current: s.current?.id === id ? r : s.current,
      list: s.list.map((x) => (x.id === id ? r : x)),
    }));
    return r;
  },

  remove: async (id) => {
    await deleteEducationRecord(id);
    set((s) => ({
      list: s.list.filter((x) => x.id !== id),
      current: s.current?.id === id ? null : s.current,
    }));
  },

  setCurrent: (r) => set({ current: r }),
}));
