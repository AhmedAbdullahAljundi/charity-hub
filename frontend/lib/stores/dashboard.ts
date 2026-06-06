"use client";

import { create } from "zustand";
import api from "@/lib/api/client";

/* ─────────── Dashboard Store ─────────── */
type DashboardEndpointKey = "stats" | "prediction" | "regions" | "workflow" | "expenses" | "financialTrend";

interface DashboardState {
  stats: any;
  familyClassification: any;
  classificationExpenses: any;
  monthlyIncome: any;
  monthlyRegistrations: any;
  monthlySeries: any[];
  financialTrendMonthly: any[];
  prediction: Record<string, unknown> | null;
  regionsOverview: any[];
  workflow: Record<string, unknown> | null;
  loadingDashboard: boolean;
  /** Set only when every dashboard endpoint failed */
  dashboardError: string | null;
  /** Per-widget failures; UI can show inline without blocking the page */
  dashboardErrors: Record<DashboardEndpointKey, string | null>;
  setStats: (stats: any) => void;
  fetchStats: () => Promise<void>;
  fetchDashboardBundle: (force?: boolean) => Promise<void>;
}

/** Module-level cache: timestamp of the last successful dashboard bundle fetch */
let _dashboardFetchedAt = 0;
const DASHBOARD_TTL_MS = 5 * 60 * 1000; // 5 minutes

export const useDashboardStore = create<DashboardState>()((set, get) => ({
  stats: {
    totalFamilies: 0,
    totalNeed: 0,
    totalIncome: 0,
    vulnerabilityIndex: 0,
    criticalMedical: 0,
    incompleteFamilies: 0,
    criticalFamilies: 0,
  },
  familyClassification: [],
  classificationExpenses: [],
  monthlyIncome: [],
  monthlyRegistrations: [],
  monthlySeries: [],
  financialTrendMonthly: [],
  prediction: null,
  regionsOverview: [],
  workflow: null,
  loadingDashboard: false,
  dashboardError: null,
  dashboardErrors: { stats: null, prediction: null, regions: null, workflow: null, expenses: null, financialTrend: null },
  setStats: (stats) => set({ stats }),
  fetchStats: async () => {
    await get().fetchDashboardBundle();
  },
  fetchDashboardBundle: async (force = false) => {
    const now = Date.now();
    // Skip fetch if data is fresh and not forced (e.g. user presses Refresh)
    if (!force && now - _dashboardFetchedAt < DASHBOARD_TTL_MS && get().stats.totalFamilies > 0) {
      return;
    }
    const prev = get();
    set({
      loadingDashboard: true,
      dashboardError: null,
      dashboardErrors: { stats: null, prediction: null, regions: null, workflow: null, expenses: null, financialTrend: null },
    });

    const results = await Promise.allSettled([
      api.get("/analytics/distribution"),
      api.get("/analytics/regional"),
      api.get("/analytics/score-trends"),
      api.get("/analytics/verification-stats"),
      api.get("/analytics/expense-distribution"),
      api.get("/analytics/financial-trend"),
    ]);

    const errors: Record<DashboardEndpointKey, string | null> = {
      stats: null,
      prediction: null,
      regions: null,
      workflow: null,
      expenses: null,
      financialTrend: null,
    };

    let statsPayload = prev.stats;
    let familyClassification = prev.familyClassification;
    let classificationExpenses = prev.classificationExpenses;
    let monthlySeries = prev.monthlySeries;
    let financialTrendMonthly = prev.financialTrendMonthly;
    let monthlyRegistrations = prev.monthlyRegistrations;
    let monthlyIncome = prev.monthlyIncome;
    let prediction = prev.prediction;
    let regionsOverview = prev.regionsOverview;
    let workflow = prev.workflow;

    const parseOk = (idx: number) => {
      const r = results[idx];
      if (r.status !== "fulfilled") return { ok: false as const, reason: "NETWORK" };
      const body = r.value.data as {
        success?: boolean;
        data?: unknown;
        error?: { code?: string; message?: string };
      };
      if (body?.success && body.data !== undefined && body.data !== null)
        return { ok: true as const, data: body.data };
      return {
        ok: false as const,
        reason: body?.error?.code || body?.error?.message || "API_ERROR",
      };
    };

    const s = parseOk(0);
    if (s.ok) {
      familyClassification = Array.isArray((s.data as any)?.byLevel) ? (s.data as any).byLevel : [];
      // Calculate basic stats from distribution
      const totalFam = (s.data as any)?.totalHouseholds || familyClassification.reduce((acc, curr: any) => acc + (curr.count || 0), 0);
      statsPayload = { ...prev.stats, totalFamilies: totalFam };
    } else {
      errors.stats = s.reason;
    }

    const p = parseOk(1);
    if (p.ok) {
      regionsOverview = Array.isArray(p.data) ? p.data : [];
    } else {
      errors.regions = p.reason;
    }

    const g = parseOk(2);
    if (g.ok) {
      monthlySeries = Array.isArray(g.data) ? g.data : [];
      // Format trends for dashboard
      monthlyRegistrations = monthlySeries.map((row: any) => ({
        month: String(row.month ?? ""),
        families: Number(row.count ?? 0),
      }));
      monthlyIncome = monthlySeries.map((row: any) => ({
        label: String(row.month ?? ""),
        amt: Number(row.avg_score ?? 0),
      }));
    } else {
      errors.prediction = g.reason;
    }

    const w = parseOk(3);
    if (w.ok) {
      // For now, map verification stats or keep workflow empty
      workflow = prev.workflow;
    } else {
      errors.workflow = w.reason;
    }

    const e = parseOk(4);
    if (e.ok) {
      classificationExpenses = Array.isArray(e.data) ? e.data : [];
    } else {
      errors.expenses = e.reason;
    }

    const f = parseOk(5);
    if (f.ok) {
      financialTrendMonthly = Array.isArray(f.data) ? f.data : [];
    } else {
      errors.financialTrend = f.reason;
    }

    const anyOk = s.ok || p.ok || g.ok || w.ok || e.ok || f.ok;
    if (!anyOk) {
      console.error("Dashboard bundle: all endpoints failed", errors);
    } else {
      _dashboardFetchedAt = Date.now(); // stamp cache only on partial/full success
    }

    set({
      stats: statsPayload,
      familyClassification,
      classificationExpenses,
      monthlySeries,
      financialTrendMonthly,
      monthlyRegistrations,
      monthlyIncome,
      prediction,
      regionsOverview,
      workflow,
      dashboardErrors: errors,
      dashboardError: anyOk ? null : "LOAD_FAILED",
      loadingDashboard: false,
    });
  },
}));
