"use client";

import * as React from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { LucideIcon } from "lucide-react";
import { MiniSparkline } from "@/components/dashboard/mini-sparkline";

export type DeltaInfo = { pct: number | null; up: boolean } | null;

export interface CompactKPICardProps {
  label: string;
  value: number | null;
  valueFormatted?: string;
  delta: DeltaInfo;
  deltaCaption: string;
  icon: LucideIcon;
  sparkData?: Record<string, number>[];
  sparkKey?: string;
  sparkColorVar?: string;
  riskBadge?: React.ReactNode;
  loading?: boolean;
  /** Icon tint */
  iconClass?: string;
  /** When true, an increase is shown as unfavorable (e.g. expenses). */
  invertDeltaColors?: boolean;
}

/** Reference: icon left, bold value, bottom trend + % , sparkline */
export function CompactKPICard({
  label,
  value,
  valueFormatted,
  delta,
  deltaCaption,
  icon: Icon,
  sparkData,
  sparkKey,
  sparkColorVar = "--primary",
  riskBadge,
  loading,
  iconClass = "text-muted-foreground",
  invertDeltaColors = false,
}: CompactKPICardProps) {
  if (loading) {
    return <Skeleton className="h-[100px] w-full rounded-lg" />;
  }

  const showSpark = sparkData && sparkData.length > 1 && sparkKey;

  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border border-border/50 bg-card shadow-sm",
        "bg-gradient-to-b from-primary/[0.04] to-transparent"
      )}
    >
      <div className="flex gap-2.5 px-3 pt-2.5">
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/45 bg-background/90",
            iconClass
          )}
        >
          <Icon className="size-4" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground leading-tight">{label}</p>
          <div className="mt-1 flex flex-wrap items-baseline gap-1.5">
            <p className="text-xl font-bold tabular-nums tracking-tight text-foreground leading-none" dir="ltr">
              {valueFormatted ?? (value === null ? "—" : value.toLocaleString())}
            </p>
            {riskBadge}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-1.5 px-3 pt-2">
        {delta && delta.pct != null && Number.isFinite(delta.pct) ? (
          <>
            {delta.up ? (
              <TrendingUp
                className={cn(
                  "size-3.5",
                  invertDeltaColors ? "text-destructive" : "text-success"
                )}
              />
            ) : (
              <TrendingDown
                className={cn(
                  "size-3.5",
                  invertDeltaColors ? "text-success" : "text-muted-foreground"
                )}
              />
            )}
            <span
              className={cn(
                "text-xs font-semibold tabular-nums",
                invertDeltaColors
                  ? delta.up
                    ? "text-destructive"
                    : "text-success"
                  : delta.up
                    ? "text-success"
                    : "text-muted-foreground"
              )}
            >
              {`${delta.up ? "+" : ""}${Math.round(delta.pct * 10) / 10}%`}
            </span>
            <span className="text-[10px] text-muted-foreground">{deltaCaption}</span>
          </>
        ) : (
          <span className="text-[10px] text-muted-foreground">{deltaCaption}</span>
        )}
      </div>
      <div className="px-2 pb-2 pt-1.5">
        {showSpark ? <MiniSparkline data={sparkData} dataKey={sparkKey} colorVar={sparkColorVar} /> : <div className="h-5" />}
      </div>
    </div>
  );
}
