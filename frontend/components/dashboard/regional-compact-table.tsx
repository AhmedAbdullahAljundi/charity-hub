"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RegionDatum } from "@/components/dashboard/region-overview-card";

type SortOption = "families-desc" | "critical-desc" | "vuln-desc";

export interface RegionalCompactTableProps {
  regions: RegionDatum[];
  loading?: boolean;
}

export function RegionalCompactTable({ regions, loading }: RegionalCompactTableProps) {
  const t = useTranslations("dashboard");
  const [sort, setSort] = React.useState<SortOption>("families-desc");
  const [filter, setFilter] = React.useState("");

  const sorted = React.useMemo(() => {
    const needle = filter.trim().toLowerCase();
    let list = regions.filter((r) => !needle || String(r.region).toLowerCase().includes(needle));
    const copy = [...list];
    if (sort === "families-desc") copy.sort((a, b) => b.familiesCount - a.familiesCount);
    if (sort === "critical-desc") copy.sort((a, b) => b.criticalCases - a.criticalCases);
    if (sort === "vuln-desc") copy.sort((a, b) => (b.averageVulnerability || 0) - (a.averageVulnerability || 0));
    return copy;
  }, [regions, sort, filter]);

  const maxFam = React.useMemo(() => Math.max(...sorted.map((r) => r.familiesCount), 1), [sorted]);

  if (loading) {
    return <Skeleton className="h-[260px] w-full rounded-lg" />;
  }

  if (!sorted.length) {
    return (
      <div className="rounded-lg border border-dashed border-border/60 bg-muted/10 px-5 py-8 text-center text-xs text-muted-foreground">
        {t("regions.empty")}
      </div>
    );
  }

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-bold text-foreground">{t("sections.regions")}</h2>
      <div className="overflow-hidden rounded-lg border border-border/50 bg-card shadow-sm">
      <div className="flex flex-col gap-2 border-b border-border/40 bg-muted/15 px-3 py-2 sm:flex-row sm:items-center">
        <p className="flex-1 text-[11px] font-semibold text-muted-foreground">{t("regions.monitor_subtitle")}</p>
        <Select value={sort} onValueChange={(v: SortOption) => setSort(v)}>
          <SelectTrigger className="h-8 w-full sm:w-[180px] text-xs rounded-lg">
            <SelectValue placeholder={t("regions.sort_label")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="families-desc">{t("regions.sort_families_desc")}</SelectItem>
            <SelectItem value="critical-desc">{t("regions.sort_critical_desc")}</SelectItem>
            <SelectItem value="vuln-desc">{t("regions.sort_avg_vuln_desc")}</SelectItem>
          </SelectContent>
        </Select>
        <Input
          className="h-8 max-w-[200px] text-xs rounded-lg"
          placeholder={t("regions.filter_all")}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>
      <div className="max-h-[260px] overflow-x-auto overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow className="h-8 hover:bg-transparent">
              <TableHead className="text-[10px] font-semibold uppercase text-muted-foreground">{t("tables.region")}</TableHead>
              <TableHead className="text-[10px] font-semibold uppercase text-muted-foreground text-end">{t("tables.families_count")}</TableHead>
              <TableHead className="text-[10px] font-semibold uppercase text-muted-foreground text-end">{t("regions.pending_research")}</TableHead>
              <TableHead className="text-[10px] font-semibold uppercase text-muted-foreground text-end">{t("regions.critical_cases")}</TableHead>
              <TableHead className="text-[10px] font-semibold uppercase text-muted-foreground text-end">{t("regions.avg_vuln")}</TableHead>
              <TableHead className="min-w-[88px] text-[10px] font-semibold uppercase text-muted-foreground">{t("regions.supervisors")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((r, idx) => {
              const regionLabel =
                r.region === "__UNSPECIFIED" || r.region === "غير محدد"
                  ? t("regions.unknown_region")
                  : r.region;
              const loadPct = Math.round((r.familiesCount / maxFam) * 100);
              return (
                <TableRow
                  key={`${r.regionKey ?? r.region}-${idx}`}
                  className={cn("text-xs border-border/30", idx % 2 === 1 ? "bg-muted/20" : "bg-transparent")}
                >
                  <TableCell className="py-1.5 align-middle">
                    <div className="text-xs font-medium leading-tight">{regionLabel}</div>
                    <Progress value={loadPct} className="mt-1 h-0.5" />
                  </TableCell>
                  <TableCell className="py-1.5 text-end tabular-nums">{r.familiesCount}</TableCell>
                  <TableCell className="py-1.5 text-end tabular-nums">{r.pendingResearch}</TableCell>
                  <TableCell className="py-1.5 text-end tabular-nums">{r.criticalCases}</TableCell>
                  <TableCell className="py-1.5 text-end tabular-nums text-xs" dir="ltr">
                    {(r.averageVulnerability || 0).toFixed(2)}
                  </TableCell>
                  <TableCell className="py-1.5 tabular-nums">{r.supervisorsCount}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
    </section>
  );
}
