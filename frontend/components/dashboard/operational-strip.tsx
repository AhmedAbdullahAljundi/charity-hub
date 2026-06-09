"use client";

import * as React from "react";
import { Link } from "@/i18n/navigation";
import {
  FolderOpen,
  AlertTriangle,
  UserPlus,
  Hourglass,
  Siren,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export interface OperationalStripProps {
  submittedNotEvaluated: number;
  criticalNotEvaluated: number;
  researchInProgress: number | null;
  awaitingFinalReview: number;
  needingImmediateIntervention: number;
  criticalMedicalCases: number;
  loading?: boolean;
}

function StripCard({
  icon: Icon,
  label,
  value,
  tone = "default",
  href = "/dashboard/households",
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  tone?: "default" | "amber" | "rose" | "blue" | "violet";
  href?: string;
}) {
  const locale = useLocale();
  const t = useTranslations("dashboard");
  const isRtl = locale === "ar";
  const Chevron = isRtl ? ChevronLeft : ChevronRight;

  const toneCls =
    tone === "rose"
      ? "border-destructive/25 bg-destructive/8"
      : tone === "amber"
        ? "border-warning/30 bg-warning/10"
        : tone === "blue"
          ? "border-chart-4/30 bg-chart-4/10"
          : tone === "violet"
            ? "border-chart-2/30 bg-chart-2/10"
            : "border-border/50 bg-card";

  return (
    <div
      className={cn(
        "flex min-w-[140px] flex-1 flex-col rounded-lg border px-2.5 pt-2 pb-1.5 shadow-sm transition-colors hover:bg-muted/20",
        toneCls
      )}
    >
      <div className="flex items-start gap-2">
        <div
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-md border border-border/40 bg-background/90",
            tone === "amber" && "text-warning-foreground",
            tone === "rose" && "text-destructive",
            tone === "blue" && "text-chart-4",
            tone === "violet" && "text-chart-2"
          )}
        >
          <Icon className="size-3.5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium leading-snug text-muted-foreground line-clamp-2">{label}</p>
          <p className="text-base font-bold tabular-nums leading-tight text-foreground mt-0.5" dir="ltr">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
        </div>
      </div>
      <Link
        href={href}
        className="mt-1.5 flex items-center gap-0.5 text-[10px] font-medium text-primary hover:underline"
      >
        {t("common.view_details")}
        <Chevron className="size-3 opacity-70" />
      </Link>
    </div>
  );
}

/** ROW 1 — reference: five compact operational cards; fifth is dual-stack alerts */
export function OperationalStrip({
  submittedNotEvaluated,
  criticalNotEvaluated,
  researchInProgress,
  awaitingFinalReview,
  needingImmediateIntervention,
  criticalMedicalCases,
  loading,
}: OperationalStripProps) {
  const locale = useLocale();
  const t = useTranslations("dashboard");
  const DetailChevron = locale === "ar" ? ChevronLeft : ChevronRight;

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-40 rounded" />
        <div className="flex flex-wrap gap-2 lg:flex-nowrap">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[88px] min-w-[140px] flex-1 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const researchVal = researchInProgress == null ? "—" : researchInProgress;

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-bold text-foreground">{t("sections.workflow_alerts")}</h2>
      <div className="flex flex-wrap gap-2 lg:flex-nowrap lg:gap-3">
        <StripCard
          icon={FolderOpen}
          label={t("strip.submitted_not_evaluated")}
          value={submittedNotEvaluated}
          tone="amber"
        />
        <StripCard
          icon={AlertTriangle}
          label={t("strip.critical_not_evaluated")}
          value={criticalNotEvaluated}
          tone="rose"
        />
        <StripCard
          icon={UserPlus}
          label={t("strip.research_in_progress")}
          value={researchVal}
          tone={researchInProgress == null ? "default" : "blue"}
        />
        <StripCard
          icon={Hourglass}
          label={t("strip.awaiting_final_review")}
          value={awaitingFinalReview}
          tone="violet"
        />
        <div
          className={cn(
            "flex min-w-[160px] flex-1 flex-col justify-between rounded-lg border border-border/50 bg-card px-2.5 pt-2 pb-1.5 shadow-sm"
          )}
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border/40 bg-destructive/12 text-destructive">
                <Siren className="size-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium leading-snug text-muted-foreground line-clamp-2">
                  {t("strip.needing_immediate_intervention")}
                </p>
                <p className="text-sm font-bold tabular-nums" dir="ltr">
                  {needingImmediateIntervention.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 border-t border-border/30 pt-2">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border/40 bg-warning/12 text-warning-foreground">
                <Stethoscope className="size-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium leading-snug text-muted-foreground line-clamp-2">
                  {t("strip.critical_medical_cases")}
                </p>
                <p className="text-sm font-bold tabular-nums" dir="ltr">
                  {criticalMedicalCases.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <Link
            href="/dashboard/medical"
            className="mt-2 flex items-center gap-0.5 text-[10px] font-medium text-primary hover:underline"
          >
            {t("common.view_details")}
            <DetailChevron className="size-3 opacity-70" />
          </Link>
        </div>
      </div>
    </section>
  );
}
