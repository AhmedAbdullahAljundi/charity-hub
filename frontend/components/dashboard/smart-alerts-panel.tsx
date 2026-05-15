"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { RecentFamiliesTable, type RecentFamilyRow } from "@/components/dashboard/recent-families-table";
import { PriorityFamiliesTable, type PriorityFamilyRow } from "@/components/dashboard/priority-families-table";
import { Skeleton } from "@/components/ui/skeleton";

export interface SmartAlertsPanelProps {
  recent: RecentFamilyRow[];
  priority: PriorityFamilyRow[];
  loading?: boolean;
}

export function SmartAlertsPanel({ recent, priority, loading }: SmartAlertsPanelProps) {
  const t = useTranslations("dashboard");

  return (
    <Card className="border-0 shadow-lg rounded-[1.65rem] overflow-hidden backdrop-blur-sm bg-[linear-gradient(135deg,var(--muted)/58_0%,var(--card)_55%)] ring-1 ring-border/85">
      <CardHeader className="border-b pb-8 bg-muted/38">
        <CardTitle className="text-xl font-bold tracking-tight leading-tight max-w-xl">
          <span suppressHydrationWarning>{t("sections.smart_alerts")}</span>
        </CardTitle>
        <CardDescription className="text-sm leading-snug">{t("smartAlerts.headline")}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-7 pt-12 pb-10 md:gap-11">
        {loading ? (
          <div className="grid xl:grid-cols-12 gap-6">
            <div className="xl:col-span-6">
              <Skeleton className="h-72 rounded-3xl shadow-inner bg-muted animate-pulse" />
            </div>
            <div className="xl:col-span-6">
              <Skeleton className="h-72 rounded-3xl shadow-inner bg-muted animate-pulse" />
            </div>
          </div>
        ) : (
          <>
            <div className="grid xl:grid-cols-12 gap-10">
              <div className="xl:col-span-6">
                <PriorityFamiliesTable rows={priority} />
              </div>
              <div className="xl:col-span-6">
                <RecentFamiliesTable rows={recent} />
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
