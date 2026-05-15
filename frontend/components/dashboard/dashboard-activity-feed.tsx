"use client";

import * as React from "react";
import { Bell } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { PredictionPayload } from "@/components/dashboard/financial-forecast-strip";

export interface DashboardActivityFeedProps {
  backlogFamilies: number;
  overdueMedical: number;
  staleQueueCount: number;
  prediction: PredictionPayload | null;
  predictionFailed?: boolean;
  loading?: boolean;
}

export function DashboardActivityFeed({
  backlogFamilies,
  overdueMedical,
  staleQueueCount,
  prediction,
  predictionFailed,
  loading,
}: DashboardActivityFeedProps) {
  const t = useTranslations("dashboard");

  type FeedItem = { id: string; tone: "default" | "amber" | "rose"; text: string; meta?: string };

  const items = React.useMemo(() => {
    const out: FeedItem[] = [];
    if (backlogFamilies > 0) {
      out.push({
        id: "bl",
        tone: "amber",
        text: t("feed.backlog"),
        meta: backlogFamilies.toLocaleString(),
      });
    }
    if (overdueMedical > 0) {
      out.push({
        id: "om",
        tone: "rose",
        text: t("feed.overdue_medical"),
        meta: overdueMedical.toLocaleString(),
      });
    }
    if (staleQueueCount > 0) {
      out.push({
        id: "st",
        tone: "amber",
        text: t("feed.stale_queue"),
        meta: staleQueueCount.toLocaleString(),
      });
    }
    if (!predictionFailed && prediction?.financialRiskLevel === "HIGH") {
      out.push({ id: "rk", tone: "rose", text: t("feed.risk_high") });
    }
    return out;
  }, [t, backlogFamilies, overdueMedical, staleQueueCount, prediction, predictionFailed]);

  if (loading) {
    return (
      <div className="rounded-xl border border-border/60 bg-card/60 p-4 space-y-3 animate-pulse">
        <div className="h-3 w-24 bg-muted rounded" />
        <div className="h-10 bg-muted rounded-lg" />
        <div className="h-10 bg-muted rounded-lg" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/60 bg-card/80 shadow-sm">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/50 bg-muted/10">
        <Bell className="size-3.5 text-muted-foreground" />
        <span className="text-xs font-semibold text-muted-foreground">{t("sections.activity_feed")}</span>
      </div>
      <ul className="max-h-[220px] overflow-y-auto divide-y divide-border/40">
        {items.length === 0 ? (
          <li className="px-3 py-6 text-center text-xs text-muted-foreground">{t("common.empty_feed")}</li>
        ) : (
          items.map((it) => (
            <li key={it.id} className="px-3 py-2.5 flex items-start gap-2.5">
              <span
                className={cn(
                  "mt-1 size-1.5 rounded-full shrink-0",
                  it.tone === "rose" ? "bg-destructive" : it.tone === "amber" ? "bg-warning" : "bg-primary"
                )}
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs leading-snug text-foreground">{it.text}</p>
                {it.meta ? (
                  <p className="text-[11px] tabular-nums text-muted-foreground mt-0.5" dir="ltr">
                    {it.meta}
                  </p>
                ) : null}
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
