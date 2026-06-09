"use client";

import { create } from "zustand";
import { getDashboardSummary } from "@/lib/api/analytics-api";

/* ─────────── Dashboard Store ─────────── */
type DashboardEndpointKey = "summary";

interface DashboardState {
  stats: {
    totalFamilies: number;
    totalNeed: number;
    criticalFamilies: number;
    criticalMedical: number;
    incompleteFamilies: number;
    pendingDecision: number;
    fieldVisitRequired: number;
  };
  familyClassification: any[];
  classificationExpenses: any[];
  monthlySeries: any[];
  prediction: Record<string, unknown> | null;
  regionsOverview: any[];
  workflow: Record<string, unknown> | null;
  loadingDashboard: boolean;
  /** Set only when the dashboard endpoint failed */
  dashboardError: string | null;
  /** Per-widget failures */
  dashboardErrors: Record<DashboardEndpointKey, string | null> & {
    stats: string | null;
    prediction: string | null;
    regions: string | null;
    workflow: string | null;
    expenses: string | null;
    financialTrend: string | null;
  };
  setStats: (stats: any) => void;
  fetchStats: () => Promise<void>;
  fetchDashboardBundle: (force?: boolean) => Promise<void>;
}

/** Module-level cache timestamp */
let _dashboardFetchedAt = 0;
const DASHBOARD_TTL_MS = 5 * 60 * 1000; // 5 minutes

const EMPTY_ERRORS = {
  summary: null,
  stats: null,
  prediction: null,
  regions: null,
  workflow: null,
  expenses: null,
  financialTrend: null,
};

export const useDashboardStore = create<DashboardState>()((set, get) => ({
  stats: {
    totalFamilies: 0,
    totalNeed: 0,
    criticalFamilies: 0,
    criticalMedical: 0,
    incompleteFamilies: 0,
    pendingDecision: 0,
    fieldVisitRequired: 0,
  },
  familyClassification: [],
  classificationExpenses: [],
  monthlySeries: [],
  prediction: null,
  regionsOverview: [],
  workflow: null,
  loadingDashboard: false,
  dashboardError: null,
  dashboardErrors: { ...EMPTY_ERRORS },

  setStats: (stats) => set({ stats }),

  fetchStats: async () => {
    await get().fetchDashboardBundle();
  },

  fetchDashboardBundle: async (force = false) => {
    const now = Date.now();
    // Skip fetch if data is fresh and not forced
    if (
      !force &&
      now - _dashboardFetchedAt < DASHBOARD_TTL_MS &&
      get().stats.totalFamilies > 0
    ) {
      return;
    }

    set({
      loadingDashboard: true,
      dashboardError: null,
      dashboardErrors: { ...EMPTY_ERRORS },
    });

    try {
      const data = await getDashboardSummary();

      if (!data) throw new Error("EMPTY_RESPONSE");

      // ── تعيين الـ stats ────────────────────────────────────────────
      const stats = {
        totalFamilies: Number(data.stats?.totalFamilies ?? 0),
        totalNeed: Number(data.stats?.totalNeed ?? data.stats?.pendingDecision ?? 0),
        criticalFamilies: Number(data.stats?.criticalFamilies ?? 0),
        criticalMedical: Number(data.stats?.criticalMedical ?? 0),
        incompleteFamilies: Number(data.stats?.incompleteFamilies ?? 0),
        pendingDecision: Number(data.stats?.pendingDecision ?? 0),
        fieldVisitRequired: Number(data.stats?.fieldVisitRequired ?? 0),
      };

      // ── تعيين monthlySeries (صيغة صحيحة لـ FinancialIntelligenceRow) ──
      const monthlySeries = Array.isArray(data.monthlySeries)
        ? data.monthlySeries.map((row: any) => ({
            month: String(row.month ?? ""),
            monthLabelShort: String(row.monthLabelShort ?? row.month ?? ""),
            householdIncome: Number(row.householdIncome ?? 0),
            householdExpenses: Number(row.householdExpenses ?? 0),
            medicalSpend: Number(row.medicalSpend ?? 0),
          }))
        : [];

      // ── تعيين prediction ────────────────────────────────────────────
      const prediction = data.prediction ?? null;

      // ── تعيين regionsOverview (صيغة صحيحة لـ RegionalCompactTable) ──
      const regionsOverview = Array.isArray(data.regionsOverview)
        ? data.regionsOverview.map((r: any) => ({
            region: String(r.region ?? r.governorate ?? "__UNSPECIFIED"),
            regionKey: String(r.regionKey ?? r.region ?? ""),
            familiesCount: Number(r.familiesCount ?? r.count ?? 0),
            pendingResearch: Number(r.pendingResearch ?? 0),
            criticalCases: Number(r.criticalCases ?? 0),
            supervisorsCount: Number(r.supervisorsCount ?? 0),
            averageVulnerability: Number(r.averageVulnerability ?? r.avgPercent ?? 0),
          }))
        : [];

      // ── تعيين workflow ──────────────────────────────────────────────
      const workflow = data.workflow ?? {
        recentFamilies: [],
        priorityFamilies: [],
        queueRows: [],
        registrationBacklogFamilies: 0,
        overdueMedicalReviews: 0,
      };

      // ── تعيين التصنيفات ────────────────────────────────────────────
      const familyClassification = Array.isArray(data.familyClassification)
        ? data.familyClassification
        : [];

      const classificationExpenses = Array.isArray(data.classificationExpenses)
        ? data.classificationExpenses
        : [];

      _dashboardFetchedAt = Date.now();

      set({
        stats,
        monthlySeries,
        prediction,
        regionsOverview,
        workflow,
        familyClassification,
        classificationExpenses,
        dashboardError: null,
        dashboardErrors: { ...EMPTY_ERRORS },
        loadingDashboard: false,
      });
    } catch (err: any) {
      const errMsg = err?.response?.data?.error?.message || err?.message || "LOAD_FAILED";
      console.error("Dashboard bundle failed:", errMsg);
      set({
        dashboardError: errMsg,
        dashboardErrors: {
          ...EMPTY_ERRORS,
          summary: errMsg,
          stats: errMsg,
          prediction: errMsg,
          regions: errMsg,
          workflow: errMsg,
        },
        loadingDashboard: false,
      });
    }
  },
}));
