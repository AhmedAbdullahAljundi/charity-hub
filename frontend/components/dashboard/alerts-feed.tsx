"use client";

import * as React from "react";
import { Link } from "@/i18n/navigation";
import { Bell, ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { PredictionPayload } from "@/components/dashboard/financial-forecast-strip";

export interface AlertsFeedProps {
  pendingEvaluations: number;
  backlogFamilies: number;
  overdueMedical: number;
  staleQueueCount: number;
  prediction: PredictionPayload | null;
  predictionFailed?: boolean;
  loading?: boolean;
}

type FeedRow = { id: string; tone: "default" | "amber" | "rose"; text: string; count?: number; minutesAgo: number };

/** Reference: latest alerts column with relative timestamps (client-only to avoid hydration mismatch) */
export function AlertsFeed({
  pendingEvaluations,
  backlogFamilies,
  overdueMedical,
  staleQueueCount,
  prediction,
  predictionFailed,
  loading,
}: AlertsFeedProps) {
  const locale = useLocale();
  const t = useTranslations("dashboard");
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => {
    setTimeout(() => setHydrated(true), 0);
  }, []);

  const Chevron = locale === "ar" ? ChevronLeft : ChevronRight;

  const rows = React.useMemo(() => {
    const out: FeedRow[] = [];
    let tmin = 4;
    if (pendingEvaluations > 0) {
      out.push({
        id: "pe",
        tone: "amber",
        text: t("feed.overdue_evaluations"),
        count: pendingEvaluations,
        minutesAgo: tmin,
      });
      tmin += 6;
    }
    if (backlogFamilies > 0) {
      out.push({
        id: "bl",
        tone: "amber",
        text: t("feed.new_family_urgent_eval"),
        count: backlogFamilies,
        minutesAgo: tmin,
      });
      tmin += 7;
    }
    if (overdueMedical > 0) {
      out.push({
        id: "om",
        tone: "rose",
        text: t("feed.urgent_medical_cases"),
        count: overdueMedical,
        minutesAgo: tmin,
      });
      tmin += 5;
    }
    if (staleQueueCount > 0) {
      out.push({
        id: "st",
        tone: "amber",
        text: t("feed.stale_research"),
        count: staleQueueCount,
        minutesAgo: tmin,
      });
      tmin += 8;
    }
    if (!predictionFailed && prediction?.financialRiskLevel === "HIGH") {
      out.push({ id: "rk", tone: "rose", text: t("feed.critical_financial_signal"), minutesAgo: tmin + 3 });
    }
    return out;
  }, [t, pendingEvaluations, backlogFamilies, overdueMedical, staleQueueCount, prediction, predictionFailed]);

  if (loading) {
    return (
      <div className="animate-pulse rounded-lg border border-border/50 bg-card p-3">
        <div className="mb-2 h-3 w-32 rounded bg-muted" />
        <div className="h-7 rounded-md bg-muted" />
        <div className="mt-2 h-7 rounded-md bg-muted" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-lg border border-border/50 bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b border-border/35 bg-muted/15 px-3 py-2.5">
        <Bell className="size-3 text-muted-foreground" />
        <span className="text-[11px] font-bold text-foreground">{t("tables.latest_alerts_title")}</span>
      </div>
      <ul className="max-h-[280px] flex-1 divide-y divide-border/30 overflow-y-auto">
        {rows.length === 0 ? (
          <li className="px-3 py-6 text-center text-[11px] text-muted-foreground">{t("common.empty_feed")}</li>
        ) : (
          rows.map((it) => (
            <li key={it.id} className="flex gap-2 px-3 py-2">
              <span
                className={cn(
                  "mt-1 size-1.5 shrink-0 rounded-full",
                  it.tone === "rose" ? "bg-destructive" : it.tone === "amber" ? "bg-warning" : "bg-primary"
                )}
              />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] leading-snug text-foreground">{it.text}</p>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0 text-[10px] text-muted-foreground">
                  {it.count != null ? (
                    <span className="tabular-nums" dir="ltr">
                      {it.count.toLocaleString()}
                    </span>
                  ) : null}
                  <span className="tabular-nums" suppressHydrationWarning>
                    {hydrated ? t("feed.minutes_ago", { count: it.minutesAgo }) : "\u00a0"}
                  </span>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
      <div className="mt-auto border-t border-border/35 px-3 py-2">
        <Link
          href="/dashboard/families"
          className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
        >
          {t("common.view_all")}
          <Chevron className="size-3 opacity-70" />
        </Link>
      </div>
    </div>
  );
}
