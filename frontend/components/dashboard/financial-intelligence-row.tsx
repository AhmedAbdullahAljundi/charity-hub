"use client";

import * as React from "react";
import { DollarSign, Wallet, TrendingUp, Activity } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { CompactKPICard } from "@/components/dashboard/compact-kpi-card";
import type { PredictionPayload } from "@/components/dashboard/financial-forecast-strip";
import { cn } from "@/lib/utils";

type Monthly = {
  monthLabelShort?: string;
  householdIncome?: number;
  householdExpenses?: number;
  medicalSpend?: number;
};

function lastPairDelta(series: Monthly[], key: keyof Monthly): { pct: number | null; up: boolean } {
  if (!series || series.length < 2) return { pct: null, up: false };
  const a = Number(series[series.length - 2][key] ?? 0);
  const b = Number(series[series.length - 1][key] ?? 0);
  if (a === 0) return b > 0 ? { pct: 100, up: true } : { pct: null, up: false };
  const pct = ((b - a) / Math.abs(a)) * 100;
  return { pct, up: b >= a };
}

export interface FinancialIntelligenceRowProps {
  monthlySeries: Monthly[];
  prediction: PredictionPayload | null;
  loading?: boolean;
  predictionFailed?: boolean;
}

/** ROW 2 — reference order: income, expenses, medical, predicted balance */
export function FinancialIntelligenceRow({
  monthlySeries,
  prediction,
  loading,
  predictionFailed,
}: FinancialIntelligenceRowProps) {
  const t = useTranslations("dashboard");
  const series = monthlySeries ?? [];
  const cur = t("stats.currency").trim();
  const tail = React.useMemo(() => {
    const s = series.slice(-8);
    return s.map((r) => ({
      ...r,
      netBalanceProxy: Number(r.householdIncome ?? 0) - Number(r.householdExpenses ?? 0),
    }));
  }, [series]);

  const sparkRows = tail as unknown as Record<string, number>[];

  const incDelta = lastPairDelta(series, "householdIncome");
  const expDelta = lastPairDelta(series, "householdExpenses");
  const medDelta = lastPairDelta(series, "medicalSpend");
  const balDelta = React.useMemo(() => {
    if (!series || series.length < 2) return { pct: null as number | null, up: false };
    const a =
      Number(series[series.length - 2].householdIncome ?? 0) - Number(series[series.length - 2].householdExpenses ?? 0);
    const b =
      Number(series[series.length - 1].householdIncome ?? 0) - Number(series[series.length - 1].householdExpenses ?? 0);
    if (Math.abs(a) < 1e-6) return b > 0 ? { pct: 100, up: true } : { pct: null, up: false };
    const pct = ((b - a) / Math.abs(a)) * 100;
    return { pct, up: b >= a };
  }, [series]);

  const lastIncome = series.length ? Number(series[series.length - 1].householdIncome ?? 0) : 0;
  const lastExp = series.length ? Number(series[series.length - 1].householdExpenses ?? 0) : 0;
  const lastMed = series.length ? Number(series[series.length - 1].medicalSpend ?? 0) : 0;
  const predBal = predictionFailed ? null : Number(prediction?.predictedBalance ?? 0);

  const fmtMoney = (n: number) => `${n.toLocaleString()} ${cur}`;

  const riskBadge =
    prediction && !predictionFailed ? (
      <Badge
        variant="secondary"
        className={cn(
          "h-5 px-1.5 text-[10px] font-semibold",
          prediction.financialRiskLevel === "HIGH" &&
            "border-destructive/30 bg-destructive/10 text-destructive",
          prediction.financialRiskLevel === "MEDIUM" &&
            "border-warning/30 bg-warning/12 text-warning-foreground",
          prediction.financialRiskLevel !== "HIGH" &&
            prediction.financialRiskLevel !== "MEDIUM" &&
            "border-success/30 bg-success/12 text-success"
        )}
      >
        {prediction.financialRiskLevel === "HIGH"
          ? t("financial.risk_high")
          : prediction.financialRiskLevel === "MEDIUM"
            ? t("financial.risk_medium")
            : t("financial.stable")}
      </Badge>
    ) : undefined;

  const deltaCap = t("financial_row.from_last_month");
  const deltaCapBal = t("financial_row.from_current_month");

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-bold text-foreground">{t("sections.financial_kpis_monthly")}</h2>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <CompactKPICard
          loading={loading}
          label={t("financial_row.monthly_income")}
          value={lastIncome}
          valueFormatted={fmtMoney(lastIncome)}
          delta={incDelta}
          deltaCaption={deltaCap}
          icon={DollarSign}
          iconClass="text-success"
          sparkData={sparkRows}
          sparkKey="householdIncome"
          sparkColorVar="--primary"
        />
      <CompactKPICard
        loading={loading}
        label={t("financial_row.monthly_expenses")}
        value={lastExp}
        valueFormatted={fmtMoney(lastExp)}
        delta={expDelta}
        deltaCaption={deltaCap}
        icon={Wallet}
        iconClass="text-destructive"
        invertDeltaColors
        sparkData={sparkRows}
        sparkKey="householdExpenses"
        sparkColorVar="--destructive"
      />
        <CompactKPICard
          loading={loading}
          label={t("financial_row.medical_spend")}
          value={lastMed}
          valueFormatted={fmtMoney(lastMed)}
          delta={medDelta}
          deltaCaption={deltaCap}
          icon={Activity}
          iconClass="text-sky-600 dark:text-sky-400"
          sparkData={sparkRows}
          sparkKey="medicalSpend"
          sparkColorVar="--chart-5"
        />
        <CompactKPICard
          loading={loading}
          label={t("financial_row.predicted_balance")}
          value={predBal}
          valueFormatted={predBal === null ? "—" : fmtMoney(predBal)}
          delta={predictionFailed ? null : balDelta}
          deltaCaption={deltaCapBal}
          icon={TrendingUp}
          iconClass="text-violet-600 dark:text-violet-400"
          sparkData={sparkRows}
          sparkKey="netBalanceProxy"
          sparkColorVar="--chart-2"
          riskBadge={riskBadge}
        />
      </div>
    </section>
  );
}
