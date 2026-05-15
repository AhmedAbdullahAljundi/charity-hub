"use client";

import * as React from "react";
import { Users, ShieldOff, AlertOctagon, HeartCrack, Scale, Footprints } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type ClassSlice = { classificationKey?: string; value: number };

function countForKey(slices: ClassSlice[], key: string) {
  const f = slices.find((s) => s.classificationKey === key);
  return f?.value ?? 0;
}

export interface FamilyStatsStripProps {
  totalFamilies: number;
  familyClassification: ClassSlice[];
  /** Composite “field activity” from real ops data (pending research + queues) */
  fieldActivityVolume: number;
  loading?: boolean;
}

/** ROW 3 — six compact stat chips (reference dashboard) */
export function FamilyStatsStrip({
  totalFamilies,
  familyClassification,
  fieldActivityVolume,
  loading,
}: FamilyStatsStripProps) {
  const t = useTranslations("dashboard");
  const slices = familyClassification ?? [];

  const outPriority = countForKey(slices, "OUT_OF_PRIORITY");
  const veryFragile = countForKey(slices, "VERY_FRAGILE");
  const fragile = countForKey(slices, "FRAGILE");
  const criticalBand = veryFragile + fragile;
  const extremelyNeedy = veryFragile;
  const moderate = countForKey(slices, "MODERATE");
  const weak = countForKey(slices, "WEAK");
  const averageBand = moderate + weak;

  const pct = (n: number) => (totalFamilies > 0 ? ((n / totalFamilies) * 100).toFixed(1) : "0");

  const items = [
    { key: "tot", icon: Users, label: t("family_strip.total_families"), value: totalFamilies, sub: null as string | null },
    {
      key: "oop",
      icon: ShieldOff,
      label: t("family_strip.out_of_priority"),
      value: outPriority,
      sub: t("family_strip.pct_of_total", { pct: pct(outPriority) }),
    },
    {
      key: "crit",
      icon: AlertOctagon,
      label: t("family_strip.critical_families"),
      value: criticalBand,
      sub: t("family_strip.pct_of_total", { pct: pct(criticalBand) }),
    },
    {
      key: "ext",
      icon: HeartCrack,
      label: t("family_strip.extremely_needy"),
      value: extremelyNeedy,
      sub: t("family_strip.pct_of_total", { pct: pct(extremelyNeedy) }),
    },
    {
      key: "avg",
      icon: Scale,
      label: t("family_strip.average_families"),
      value: averageBand,
      sub: t("family_strip.pct_of_total", { pct: pct(averageBand) }),
    },
    {
      key: "vis",
      icon: Footprints,
      label: t("family_strip.field_activity"),
      value: fieldActivityVolume,
      sub: t("family_strip.field_activity_hint"),
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[72px] rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-bold text-foreground">{t("sections.family_stats")}</h2>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <div
              key={it.key}
              className={cn(
                "flex flex-col rounded-lg border border-border/50 bg-card px-2 py-2 shadow-sm",
                "bg-gradient-to-b from-muted/20 to-transparent"
              )}
            >
              <div className="flex items-center gap-1.5">
                <Icon className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="text-[10px] font-medium leading-tight text-muted-foreground line-clamp-2">{it.label}</span>
              </div>
              <p className="mt-1 text-lg font-bold tabular-nums leading-none" dir="ltr">
                {it.value.toLocaleString()}
              </p>
              {it.sub ? <p className="mt-0.5 text-[9px] text-muted-foreground">{it.sub}</p> : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
