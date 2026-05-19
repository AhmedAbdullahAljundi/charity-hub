"use client";

import { create } from "zustand";
import {
  calculateScore,
  getScoreHistory,
  getLatestScore,
  simulateWhatIf,
} from "@/lib/api/scoring-api";
import type { ScoreResultDto, SimulationResult } from "@/lib/types/api";

interface ScoringState {
  liveScore: ScoreResultDto | null;
  history: ScoreResultDto[];
  isCalculating: boolean;
  error: string | null;
  simulationResult: SimulationResult | null;
  calculate: (householdId: string) => Promise<ScoreResultDto>;
  fetchLatest: (householdId: string) => Promise<ScoreResultDto | null>;
  fetchHistory: (householdId: string) => Promise<void>;
  simulate: (householdId: string, modifications: Array<{ field: string; value: unknown }>) => Promise<void>;
  setLiveScore: (score: ScoreResultDto | null) => void;
  clear: () => void;
}

export const useScoringStore = create<ScoringState>((set) => ({
  liveScore: null,
  history: [],
  isCalculating: false,
  error: null,
  simulationResult: null,

  calculate: async (householdId) => {
    set({ isCalculating: true, error: null });
    try {
      const result = await calculateScore(householdId);
      set({ liveScore: result, isCalculating: false });
      return result;
    } catch (e) {
      set({ isCalculating: false, error: (e as Error).message });
      throw e;
    }
  },

  fetchLatest: async (householdId) => {
    try {
      const result = await getLatestScore(householdId);
      set({ liveScore: result });
      return result;
    } catch {
      return null;
    }
  },

  fetchHistory: async (householdId) => {
    const history = await getScoreHistory(householdId);
    set({ history });
  },

  simulate: async (householdId, modifications) => {
    set({ isCalculating: true, error: null });
    try {
      const simulationResult = await simulateWhatIf({ householdId, modifications });
      set({ simulationResult, isCalculating: false });
    } catch (e) {
      set({ isCalculating: false, error: (e as Error).message });
      throw e;
    }
  },

  setLiveScore: (score) => set({ liveScore: score }),
  clear: () => set({ liveScore: null, history: [], simulationResult: null, error: null }),
}));
