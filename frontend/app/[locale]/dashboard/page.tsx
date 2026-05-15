"use client";

import dynamic from "next/dynamic";
import { RefreshCw } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useDashboardStore } from "@/lib/store";
import { OperationalStrip } from "@/components/dashboard/operational-strip";
import { FinancialIntelligenceRow } from "@/components/dashboard/financial-intelligence-row";
import { FamilyStatsStrip } from "@/components/dashboard/family-stats-strip";
import { RegionalCompactTable } from "@/components/dashboard/regional-compact-table";
import { RecentFamiliesTable, type RecentFamilyRow } from "@/components/dashboard/recent-families-table";
import { PriorityFamiliesTable, type PriorityFamilyRow } from "@/components/dashboard/priority-families-table";
import { AlertsFeed } from "@/components/dashboard/alerts-feed";
import type { RegionDatum } from "@/components/dashboard/region-overview-card";
import type { PredictionPayload } from "@/components/dashboard/financial-forecast-strip";
import type { WorkflowQueueRow } from "@/components/dashboard/workflow-queue-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const DashboardAnalytics = dynamic(
  () => import("@/components/dashboard/analytics-grid").then((m) => ({ default: m.AnalyticsGrid })),
  {
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[248px] rounded-lg border border-border/40 bg-muted/20 animate-pulse" />
        ))}
      </div>
    ),
  }
);

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const {
    stats,
    familyClassification,
    classificationExpenses,
    monthlySeries,
    prediction,
    regionsOverview,
    workflow,
    fetchDashboardBundle,
    loadingDashboard,
    dashboardError,
    dashboardErrors,
  } = useDashboardStore();

  useEffect(() => {
    fetchDashboardBundle();
  }, [fetchDashboardBundle]);

  const queueRows: WorkflowQueueRow[] = Array.isArray((workflow as Record<string, unknown> | null)?.queueRows)
    ? (workflow as { queueRows: WorkflowQueueRow[] }).queueRows
    : [];

  const predictionPayload = prediction as PredictionPayload | null;

  const regionData: RegionDatum[] = Array.isArray(regionsOverview) ? regionsOverview : [];

  const recentRows: RecentFamilyRow[] = Array.isArray((workflow as Record<string, unknown> | null)?.recentFamilies)
    ? (workflow as { recentFamilies: RecentFamilyRow[] }).recentFamilies
    : [];

  const priorityRows: PriorityFamilyRow[] = Array.isArray((workflow as Record<string, unknown> | null)?.priorityFamilies)
    ? (workflow as { priorityFamilies: PriorityFamilyRow[] }).priorityFamilies
    : [];

  const backlog = Number((workflow as Record<string, unknown> | null)?.registrationBacklogFamilies ?? 0);
  const overdueMedical = Number((workflow as Record<string, unknown> | null)?.overdueMedicalReviews ?? 0);

  const pendingFieldResearchSum = useMemo(
    () => regionData.reduce((s, r) => s + (r.pendingResearch ?? 0), 0),
    [regionData]
  );

  const fieldActivityVolume = useMemo(
    () => backlog + queueRows.length + pendingFieldResearchSum,
    [backlog, queueRows.length, pendingFieldResearchSum]
  );

  const partialFailure = useMemo(
    () => Object.values(dashboardErrors).some((e) => e != null),
    [dashboardErrors]
  );

  const workflowFailed = !!dashboardErrors.workflow;

  const statsLoading = loadingDashboard && !dashboardErrors.stats;

  return (
    <div className="mx-auto max-w-[1200px] space-y-4 px-1 pb-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-0.5">
          <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">{t("header.title")}</h1>
          <p className="text-xs text-muted-foreground md:text-sm">{t("header.subtitle")}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={loadingDashboard}
          onClick={() => fetchDashboardBundle(true)}
          className="h-8 shrink-0 gap-2 rounded-lg border-border/60 text-xs"
        >
          <RefreshCw className={`size-3.5 ${loadingDashboard ? "animate-spin" : ""}`} />
          {t("common.retry")}
        </Button>
      </div>

      {dashboardError ? (
        <Alert variant="destructive" className="rounded-lg">
          <AlertTitle>{t("common.error")}</AlertTitle>
          <AlertDescription>{t("common.retry")}</AlertDescription>
        </Alert>
      ) : null}

      {partialFailure && !dashboardError ? (
        <Alert className="rounded-lg border-warning/35 bg-warning/8">
          <AlertTitle className="text-xs font-semibold">{t("common.partial_banner")}</AlertTitle>
          <AlertDescription className="text-[11px] opacity-90">
            {[
              dashboardErrors.stats && `stats: ${dashboardErrors.stats}`,
              dashboardErrors.prediction && `prediction: ${dashboardErrors.prediction}`,
              dashboardErrors.regions && `regions: ${dashboardErrors.regions}`,
              dashboardErrors.workflow && `workflow: ${dashboardErrors.workflow}`,
            ]
              .filter(Boolean)
              .join(" · ")}
          </AlertDescription>
        </Alert>
      ) : null}

      <OperationalStrip
        submittedNotEvaluated={backlog}
        criticalNotEvaluated={Number(stats?.criticalFamilies ?? 0)}
        researchInProgress={dashboardErrors.regions ? null : pendingFieldResearchSum}
        awaitingFinalReview={workflowFailed ? 0 : queueRows.length}
        needingImmediateIntervention={Number(stats?.incompleteFamilies ?? 0)}
        criticalMedicalCases={Number(stats?.criticalMedical ?? 0)}
        loading={loadingDashboard}
      />

      <FinancialIntelligenceRow
        monthlySeries={monthlySeries ?? []}
        prediction={predictionPayload}
        loading={loadingDashboard}
        predictionFailed={!!dashboardErrors.prediction}
      />

      <FamilyStatsStrip
        totalFamilies={Number(stats?.totalFamilies ?? 0)}
        familyClassification={familyClassification ?? []}
        fieldActivityVolume={fieldActivityVolume}
        loading={statsLoading}
      />

      <DashboardAnalytics
        familyClassification={familyClassification ?? []}
        classificationExpenses={classificationExpenses ?? []}
        monthlySeries={monthlySeries ?? []}
        loading={statsLoading}
      />

      <RegionalCompactTable regions={regionData} loading={loadingDashboard && !dashboardErrors.regions} />

      <section className="space-y-2">
        <h2 className="text-sm font-bold text-foreground">{t("sections.action_center")}</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <RecentFamiliesTable rows={recentRows} loading={loadingDashboard && !workflowFailed} />
          <PriorityFamiliesTable rows={priorityRows} loading={loadingDashboard && !workflowFailed} />
          <AlertsFeed
            pendingEvaluations={Number(stats?.incompleteFamilies ?? 0)}
            backlogFamilies={backlog}
            overdueMedical={workflowFailed ? 0 : overdueMedical}
            staleQueueCount={workflowFailed ? 0 : queueRows.length}
            prediction={predictionPayload}
            predictionFailed={!!dashboardErrors.prediction}
            loading={loadingDashboard}
          />
        </div>
      </section>
    </div>
  );
}
