import type { EligibilityLevel } from "@/lib/types/api";

export const ELIGIBILITY_COLORS: Record<EligibilityLevel, string> = {
  CRITICAL: "var(--color-critical)",
  HIGH_NEED: "#f97316",
  MODERATE_NEED: "var(--color-alert)",
  LOW_NEED: "#3b82f6",
  NOT_ELIGIBLE: "#94a3b8",
};

export const ELIGIBILITY_TAILWIND: Record<EligibilityLevel, string> = {
  CRITICAL: "bg-rose-600 text-white",
  HIGH_NEED: "bg-orange-500 text-white",
  MODERATE_NEED: "bg-amber-500 text-slate-900",
  LOW_NEED: "bg-blue-500 text-white",
  NOT_ELIGIBLE: "bg-slate-400 text-white",
};

export function parsePercent(value: string | number | null | undefined): number {
  if (value == null) return 0;
  const n = typeof value === "number" ? value : parseFloat(String(value));
  return Number.isFinite(n) ? n : 0;
}

export function categoryBarsFromLayers(
  layers: Array<{ layerId: string; cappedScore: string }> | undefined
): { id: string; value: number }[] {
  const ids = ["L1", "L2", "L3", "L4", "L5", "L6"];
  const map = new Map((layers || []).map((l) => [l.layerId, parsePercent(l.cappedScore)]));
  return ids.map((id) => ({ id, value: map.get(id) ?? 0 }));
}
