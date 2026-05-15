"use client";

import * as React from "react";
import { TrendingUp, Landmark, Receipt, HeartHandshake, Activity, GaugeCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { DashboardKpiCard } from "@/components/dashboard/kpi-card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type PredictionPayload = {
  predictedBalance?: number;
  predictionConfidence?: number;
  expectedIncome?: number;
  expectedExpenses?: number;
  expectedAid?: number;
  expectedMedicalExposure?: number;
  financialRiskLevel?: "LOW" | "MEDIUM" | "HIGH";
  criticalMedicalSignals?: number;
};

export interface FinancialForecastStripProps {
  prediction: PredictionPayload | null;
  loading?: boolean;
}

export function FinancialForecastStrip({ prediction, loading }: FinancialForecastStripProps) {
  const t = useTranslations("dashboard");

  const risk = prediction?.financialRiskLevel || "LOW";
  const riskClass =
    risk === "HIGH"
      ? "bg-destructive/15 text-destructive border-destructive/30"
      : risk === "MEDIUM"
        ? "bg-warning/15 text-warning-foreground border-warning/30"
        : "bg-primary/15 text-primary border-primary/25";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-3 md:gap-4">
      <DashboardKpiCard
        loading={loading}
        label={t("financial.predicted_next_balance")}
        value={
          <span dir="ltr" className="tabular-nums">
            {(prediction?.predictedBalance ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            <span className="text-xs font-semibold ml-1 text-muted-foreground">{t("stats.currency").trimStart()}</span>
          </span>
        }
        icon={TrendingUp}
        accentClass="bg-primary/15 text-primary"
        footer={null}
      />
      <DashboardKpiCard
        loading={loading}
        label={t("financial.expected_income")}
        value={
          <span dir="ltr" className="tabular-nums">
            {(prediction?.expectedIncome ?? 0).toLocaleString()}
          </span>
        }
        icon={Landmark}
        accentClass="bg-success/15 text-success"
      />
      <DashboardKpiCard
        loading={loading}
        label={t("financial.expected_expenses")}
        value={
          <span dir="ltr" className="tabular-nums">
            {(prediction?.expectedExpenses ?? 0).toLocaleString()}
          </span>
        }
        icon={Receipt}
        accentClass="bg-warning/12 text-warning-foreground"
      />
      <DashboardKpiCard
        loading={loading}
        label={t("financial.expected_aid")}
        value={
          <span dir="ltr" className="tabular-nums">
            {(prediction?.expectedAid ?? 0).toLocaleString()}
          </span>
        }
        icon={HeartHandshake}
        accentClass="bg-chart-4/12 text-chart-4"
      />
      <DashboardKpiCard
        loading={loading}
        label={t("financial.medical_exposure")}
        value={
          <span dir="ltr" className="tabular-nums">
            {(prediction?.expectedMedicalExposure ?? 0).toLocaleString()}
          </span>
        }
        icon={Activity}
        accentClass="bg-destructive/12 text-destructive"
        footer={<span>{t("financial.critical_signals")}: {prediction?.criticalMedicalSignals ?? 0}</span>}
      />
      <DashboardKpiCard
        loading={loading}
        label={t("financial.risk")}
        value={
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Badge className={cn("rounded-xl px-2.5 border", riskClass)} variant="outline">
              {t(`financial.risk_${risk.toLowerCase()}` as const)}
            </Badge>
          </div>
        }
        icon={GaugeCircle}
        accentClass="bg-chart-5/25 text-chart-5 border-chart-5/35"
        chip={
          <Badge variant="secondary" className="text-[10px] uppercase">
            {t("financial.confidence")}: {(prediction?.predictionConfidence ?? 0)}%
          </Badge>
        }
      />
    </div>
  );
}
