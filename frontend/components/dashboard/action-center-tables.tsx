"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { RecentFamiliesTable, type RecentFamilyRow } from "@/components/dashboard/recent-families-table";
import { PriorityFamiliesTable, type PriorityFamilyRow } from "@/components/dashboard/priority-families-table";
import { DashboardQuickLinks } from "@/components/dashboard/dashboard-quick-links";

export interface ActionCenterTablesProps {
  recentRows: RecentFamilyRow[];
  priorityRows: PriorityFamilyRow[];
  loading?: boolean;
}

/** ROW 5 — dual compact tables + quick actions */
export function ActionCenterTables({ recentRows, priorityRows, loading }: ActionCenterTablesProps) {
  const t = useTranslations("dashboard");

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {t("sections.action_center")}
        </h2>
        <DashboardQuickLinks />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RecentFamiliesTable rows={recentRows} loading={loading} />
        <PriorityFamiliesTable rows={priorityRows} loading={loading} />
      </div>
    </div>
  );
}
