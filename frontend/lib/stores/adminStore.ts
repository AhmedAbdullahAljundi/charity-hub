"use client";

import { create } from "zustand";
import { api } from "@/lib/api/client";

export interface RuleMeta {
  id: string;
  defaultValue: string;
  effectiveValue: string;
  overridden: boolean;
  layerId?: string;
  descriptionKey?: string;
}

interface AdminState {
  rules: RuleMeta[];
  weights: Record<string, unknown> | null;
  loading: boolean;
  simulationResult: { ruleId: string; affectedHouseholds: number } | null;
  fetchRules: () => Promise<void>;
  updateOverride: (ruleId: string, overrideValue: string, reason?: string) => Promise<void>;
  revertOverride: (ruleId: string) => Promise<void>;
  simulateRule: (ruleId: string) => Promise<void>;
}

export const useAdminStore = create<AdminState>((set) => ({
  rules: [],
  weights: null,
  loading: false,
  simulationResult: null,

  fetchRules: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get("/admin/rules");
      set({
        rules: data.data?.rules ?? [],
        weights: data.data?.weights ?? null,
        loading: false,
      });
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  updateOverride: async (ruleId, overrideValue, reason) => {
    await api.put(`/admin/rules/${ruleId}`, { overrideValue, reason });
    await useAdminStore.getState().fetchRules();
  },

  revertOverride: async (ruleId) => {
    await api.delete(`/admin/rules/${ruleId}/override`);
    await useAdminStore.getState().fetchRules();
  },

  simulateRule: async (ruleId) => {
    const { data } = await api.post(`/admin/rules/${ruleId}/simulate`);
    set({ simulationResult: data.data });
  },
}));
