"use client";

import * as React from "react";
import { ShieldAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";

export interface AlertsPanelProps {
  backlogFamilies?: number;
  overdueMedical?: number;
  loading?: boolean;
}

export function AlertsPanel({ backlogFamilies = 0, overdueMedical = 0, loading }: AlertsPanelProps) {
  const t = useTranslations("dashboard");

  return (
    <Card className="border-0 shadow-md rounded-2xl bg-gradient-to-b from-primary/10 via-card to-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-destructive" />
          {t("workflow.alerts_stub")}
        </CardTitle>
        <CardDescription>{t("sections.workflow_alerts")}</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6">
        {loading ? (
          <>
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </>
        ) : (
          <>
            <div className="p-5 rounded-2xl border bg-card hover:shadow-inner transition-all">
              <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">{t("workflow.backlog_registered")}</p>
              <p className="text-4xl font-bold tabular-nums mt-2 text-primary" dir="ltr">
                {backlogFamilies.toLocaleString()}
              </p>
            </div>
            <div className="p-5 rounded-2xl border bg-card hover:shadow-inner transition-all">
              <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">{t("workflow.overdue_medical")}</p>
              <p className="text-4xl font-bold tabular-nums mt-2 text-destructive" dir="ltr">
                {overdueMedical.toLocaleString()}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
