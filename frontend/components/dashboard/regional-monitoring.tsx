"use client";

import * as React from "react";
import { LayoutGrid } from "lucide-react";
import { RegionOverviewCard, type RegionDatum } from "@/components/dashboard/region-overview-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";

export interface RegionalMonitoringProps {
  regions: RegionDatum[];
  loading?: boolean;
}

type SortOption = "families-desc" | "critical-desc" | "vuln-desc";

export function RegionalMonitoring({ regions, loading }: RegionalMonitoringProps) {
  const t = useTranslations("dashboard");
  const [sort, setSort] = React.useState<SortOption>("families-desc");
  const [filter, setFilter] = React.useState("");

  const sorted = React.useMemo(() => {
    const needle = filter.trim().toLowerCase();
    let list = regions.filter((r) => !needle || String(r.region).toLowerCase().includes(needle));
    const copy = [...list];
    if (sort === "families-desc") copy.sort((a, b) => b.familiesCount - a.familiesCount);
    if (sort === "critical-desc") copy.sort((a, b) => b.criticalCases - a.criticalCases);
    if (sort === "vuln-desc") copy.sort((a, b) => b.averageVulnerability - a.averageVulnerability);
    return copy;
  }, [regions, sort, filter]);

  const intensityMaxFamilies = React.useMemo(() => Math.max(...sorted.map((r) => r.familiesCount), 1), [sorted]);
  const intensityMaxCritical = React.useMemo(() => Math.max(...sorted.map((r) => r.criticalCases), 1), [sorted]);

  return (
    <Card className="border-0 shadow-md rounded-2xl">
      <CardHeader className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <CardTitle className="text-xl gap-3 flex flex-wrap items-center">
            <LayoutGrid className="h-6 w-6 text-primary" />
            <span suppressHydrationWarning>{t("sections.regions")}</span>
          </CardTitle>
          <CardDescription className="mt-2 max-w-xl">{t("regions.title_hint")}</CardDescription>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
          <Select value={sort} onValueChange={(v: SortOption) => setSort(v)}>
            <SelectTrigger className="w-full md:w-[200px] rounded-xl">
              <SelectValue placeholder={t("regions.sort_label")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="families-desc">{t("regions.sort_families_desc")}</SelectItem>
              <SelectItem value="critical-desc">{t("regions.sort_critical_desc")}</SelectItem>
              <SelectItem value="vuln-desc">{t("regions.sort_avg_vuln_desc")}</SelectItem>
            </SelectContent>
          </Select>
          <Input
            aria-label={t("regions.filter_all")}
            placeholder={t("regions.filter_all")}
            className="rounded-xl max-w-[220px]"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="min-h-[280px] rounded-2xl" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-12">{t("regions.empty")}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {sorted.map((item) => (
              <RegionOverviewCard
                key={item.regionKey || item.region}
                data={item}
                intensityMaxFamilies={intensityMaxFamilies}
                intensityMaxCritical={intensityMaxCritical}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
