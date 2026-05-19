"use client";

import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const PLOT_H = 200;

type ClassSlice = {
  classificationKey?: string;
  value: number;
  fill?: string;
};

type MonthlyRow = {
  monthLabelShort?: string;
  householdIncome?: number;
  householdExpenses?: number;
  medicalSpend?: number;
};

export interface AnalyticsGridProps {
  familyClassification: ClassSlice[];
  classificationExpenses: ClassSlice[];
  monthlySeries?: MonthlyRow[];
  loading?: boolean;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-border/50 bg-card shadow-sm">
      <div className="border-b border-border/40 bg-muted/15 px-3 py-2">
        <h3 className="text-[11px] font-semibold leading-tight text-muted-foreground">{title}</h3>
      </div>
      <div className="min-h-[200px] flex-1 p-2">{children}</div>
    </div>
  );
}

function DashTooltip({ active, payload }: { active?: boolean; payload?: { value: number; name: string }[] }) {
  if (active && payload?.length) {
    return (
      <div className="rounded-md border border-border bg-popover/95 px-2 py-1.5 text-xs shadow-md">
        <p className="font-medium text-foreground">{payload[0].name}</p>
        <p className="font-semibold tabular-nums text-primary" dir="ltr">
          {Number(payload[0].value ?? 0).toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
}

const donutLegend = {
  layout: "vertical" as const,
  align: "right" as const,
  verticalAlign: "middle" as const,
  iconType: "circle" as const,
  wrapperStyle: { fontSize: 10, paddingLeft: 4 },
  formatter: (value: string) => <span className="text-[10px] text-foreground/90">{value}</span>,
};

function AnalyticsGridInner({
  familyClassification,
  classificationExpenses,
  monthlySeries,
  loading,
}: AnalyticsGridProps) {
  const t = useTranslations("dashboard");
  const gradId = React.useId().replace(/:/g, "");

  const pieClass = React.useMemo(
    () =>
      (familyClassification || []).map((c) => ({
        ...c,
        name: c.classificationKey ? t(`classification.${c.classificationKey}` as const) : "?",
      })),
    [familyClassification, t]
  );

  const pieExpense = React.useMemo(
    () =>
      (classificationExpenses || []).map((c) => ({
        ...c,
        name: c.classificationKey ? t(`classification.${c.classificationKey}` as const) : "?",
      })),
    [classificationExpenses, t]
  );

  const trendPayload = React.useMemo(() => monthlySeries ?? [], [monthlySeries]);
  const medicalBars = React.useMemo(() => trendPayload.slice(-6), [trendPayload]);

  const trendHas = trendPayload.length > 0;
  const pieClassEmpty = pieClass.length === 0 || pieClass.every((s) => !s.value);
  const pieExpEmpty = pieExpense.length === 0 || pieExpense.every((s) => !s.value);
  const medHas = medicalBars.some((m) => (m.medicalSpend ?? 0) > 0);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-lg border border-border/50 bg-card">
            <Skeleton className="h-9 w-full rounded-none" />
            <Skeleton className="m-2 h-[200px] rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  const margin = { top: 8, right: 8, left: 0, bottom: 4 };

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-bold text-foreground">{t("sections.core_analytics")}</h2>
      <div
        className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
        dir="ltr"
        style={{ direction: "ltr" }}
      >
        {/* 1 — classification donut */}
        <Panel title={t("charts.classification_distribution")}>
          <div className="h-[200px] w-full">
            {pieClassEmpty ? (
              <div className="flex h-full items-center justify-center px-3 text-center text-[11px] text-muted-foreground">
                {t("charts.empty_classification")}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 4, bottom: 4, left: 4, right: 4 }}>
                  <Pie
                    data={pieClass}
                    dataKey="value"
                    cx="38%"
                    cy="50%"
                    innerRadius={38}
                    outerRadius={62}
                    paddingAngle={2}
                    animationDuration={500}
                  >
                    {pieClass.map((entry, idx) => (
                      <Cell key={`${entry.classificationKey ?? idx}`} fill={entry.fill || "var(--chart-1)"} />
                    ))}
                  </Pie>
                  <Tooltip content={<DashTooltip />} />
                  <Legend {...donutLegend} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Panel>

        {/* 2 — expense distribution donut */}
        <Panel title={t("charts.expense_distribution_donut")}>
          <div className="h-[200px] w-full">
            {pieExpEmpty ? (
              <div className="flex h-full items-center justify-center px-3 text-center text-[11px] text-muted-foreground">
                {t("charts.empty_expenses_by_class")}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 4, bottom: 4, left: 4, right: 4 }}>
                  <Pie
                    data={pieExpense}
                    dataKey="value"
                    cx="38%"
                    cy="50%"
                    innerRadius={38}
                    outerRadius={62}
                    paddingAngle={2}
                    animationDuration={500}
                  >
                    {pieExpense.map((entry, idx) => (
                      <Cell key={`exp-${entry.classificationKey ?? idx}`} fill={entry.fill || "var(--chart-3)"} />
                    ))}
                  </Pie>
                  <Tooltip content={<DashTooltip />} />
                  <Legend {...donutLegend} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Panel>

        {/* 3 — financial trend (2 lines) */}
        <Panel title={t("charts.financial_trend_six_months")}>
          <div className="h-[200px] w-full">
            {!trendHas ? (
              <div className="flex h-full items-center justify-center px-3 text-center text-[11px] text-muted-foreground">
                {t("charts.empty_series")}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendPayload} margin={margin}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" strokeOpacity={1} vertical={false} />
                  <XAxis
                    dataKey="monthLabelShort"
                    tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    width={36}
                  />
                  <Tooltip content={<DashTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="householdIncome"
                    name={t("charts.series_income")}
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    dot={false}
                    animationDuration={500}
                  />
                  <Line
                    type="monotone"
                    dataKey="householdExpenses"
                    name={t("charts.series_expenses")}
                    stroke="var(--chart-3)"
                    strokeWidth={2}
                    dot={false}
                    animationDuration={500}
                  />
                  <Legend
                    verticalAlign="top"
                    iconType="line"
                    wrapperStyle={{ fontSize: 10 }}
                    formatter={(v) => <span className="text-[10px]">{v}</span>}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Panel>

        {/* 4 — monthly medical bar */}
        <Panel title={t("charts.medical_spend_monthly")}>
          <div className="h-[200px] w-full">
            {!medHas ? (
              <div className="flex h-full items-center justify-center px-3 text-center text-[11px] text-muted-foreground">
                {t("charts.empty_series")}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={medicalBars} margin={margin}>
                  <defs>
                    <linearGradient id={`medBar-${gradId}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-4)" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="var(--chart-4)" stopOpacity={0.4} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" strokeOpacity={1} vertical={false} />
                  <XAxis
                    dataKey="monthLabelShort"
                    tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                    width={36}
                  />
                  <Tooltip content={<DashTooltip />} />
                  <Bar
                    dataKey="medicalSpend"
                    name={t("charts.series_medical")}
                    fill={`url(#medBar-${gradId})`}
                    radius={[4, 4, 0, 0]}
                    animationDuration={500}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Panel>
      </div>
    </section>
  );
}

export const AnalyticsGrid = React.memo(AnalyticsGridInner);
