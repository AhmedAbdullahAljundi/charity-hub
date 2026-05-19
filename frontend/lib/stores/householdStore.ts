"use client";

import { create } from "zustand";
import {
  listHouseholds,
  getHousehold,
  createHousehold,
  updateHousehold,
  deleteHousehold,
} from "@/lib/api/households-api";
import type { HouseholdDto, PaginatedMeta } from "@/lib/types/api";

interface HouseholdState {
  list: HouseholdDto[];
  current: HouseholdDto | null;
  pagination: PaginatedMeta | null;
  loading: boolean;
  error: string | null;
  fetchList: (params?: Record<string, string | number | boolean | undefined>) => Promise<void>;
  fetchOne: (id: string) => Promise<HouseholdDto>;
  create: (body: Record<string, unknown>) => Promise<HouseholdDto>;
  update: (id: string, body: Record<string, unknown>) => Promise<HouseholdDto>;
  remove: (id: string) => Promise<void>;
  setCurrent: (h: HouseholdDto | null) => void;
}

export const useHouseholdStore = create<HouseholdState>((set) => ({
  list: [],
  current: null,
  pagination: null,
  loading: false,
  error: null,

  fetchList: async (params) => {
    set({ loading: true, error: null });
    try {
      const { data, meta } = await listHouseholds(params);
      set({ list: data, pagination: meta, loading: false });
    } catch (e) {
      set({ loading: false, error: (e as Error).message });
      throw e;
    }
  },

  fetchOne: async (id) => {
    set({ loading: true, error: null });
    try {
      const h = await getHousehold(id);
      set({ current: h, loading: false });
      return h;
    } catch (e) {
      set({ loading: false, error: (e as Error).message });
      throw e;
    }
  },

  create: async (body) => {
    const h = await createHousehold(body);
    set((s) => ({ list: [h, ...s.list], current: h }));
    return h;
  },

  update: async (id, body) => {
    const h = await updateHousehold(id, body);
    set((s) => ({
      current: s.current?.id === id ? h : s.current,
      list: s.list.map((x) => (x.id === id ? h : x)),
    }));
    return h;
  },

  remove: async (id) => {
    await deleteHousehold(id);
    set((s) => ({
      list: s.list.filter((x) => x.id !== id),
      current: s.current?.id === id ? null : s.current,
    }));
  },

  setCurrent: (h) => set({ current: h }),
}));
