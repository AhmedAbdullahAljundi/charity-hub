"use client";

import * as React from "react";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useTranslations } from "next-intl";

export interface RegionDatum {
  region: string;
  regionKey?: string;
  familiesCount: number;
  pendingResearch: number;
  criticalCases: number;
  supervisorsCount: number;
  averageVulnerability: number;
}

interface RegionOverviewCardProps {
  data: RegionDatum;
  intensityMaxFamilies: number;
  intensityMaxCritical: number;
}

export function RegionOverviewCard({ data, intensityMaxFamilies, intensityMaxCritical }: RegionOverviewCardProps) {
  const t = useTranslations("dashboard");
  const label = data.region === "__UNSPECIFIED" ? t("regions.unknown_region") : data.region;

  const famRatio = intensityMaxFamilies > 0 ? Math.min(100, (data.familiesCount / intensityMaxFamilies) * 100) : 0;
  const critRatio = intensityMaxCritical > 0 ? Math.min(100, (data.criticalCases / intensityMaxCritical) * 100) : 0;

  return (
    <Card className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 rounded-2xl overflow-hidden bg-card flex flex-col h-full">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="min-w-0">
          <Badge variant="secondary" className="mb-1 text-[10px] rounded-lg">
            {t("regions.title_hint")}
          </Badge>
          <CardTitle className="flex items-start gap-2 text-base leading-tight text-foreground">
            <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span className="truncate" title={label}>{label}</span>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-5">
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>{t("stats.totalFamilies")}</span>
            <span dir="ltr" className="font-semibold text-foreground tabular-nums">{data.familiesCount}</span>
          </div>
          <Progress value={famRatio} className="h-1.5 bg-muted [&>div]:bg-primary transition-all" />
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-4 text-[11px]">
          <div>
            <p className="text-muted-foreground font-medium">{t("regions.pending_research")}</p>
            <p className="text-lg font-bold tabular-nums text-foreground" dir="ltr">{data.pendingResearch}</p>
          </div>
          <div>
            <p className="text-muted-foreground font-medium">{t("regions.supervisors")}</p>
            <p className="text-lg font-bold tabular-nums text-foreground" dir="ltr">{data.supervisorsCount}</p>
          </div>
          <div>
            <p className="text-muted-foreground font-medium">{t("regions.critical_cases")}</p>
            <Badge variant="destructive" className="mt-1 text-xs tabular-nums font-bold">
              <span dir="ltr">{data.criticalCases}</span>
            </Badge>
          </div>
          <div>
            <p className="text-muted-foreground font-medium">{t("regions.avg_vuln")}</p>
            <p className="text-lg font-bold tabular-nums text-primary" dir="ltr">{data.averageVulnerability.toFixed(2)}</p>
          </div>
        </div>

        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>{t("regions.critical_cases")}</span>
            <span className={data.criticalCases > intensityMaxCritical / 4 ? "text-destructive font-semibold tabular-nums" : ""} dir="ltr">
              Δ {data.criticalCases}
            </span>
          </div>
          <Progress value={critRatio} className="h-1.5 bg-muted [&>div]:bg-destructive" />
        </div>
      </CardContent>
    </Card>
  );
}
