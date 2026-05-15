"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  FileBarChart,
  Download,
  Users,
  Wallet,
  TrendingUp,
  Activity,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ReportTypeKey = "comprehensive" | "financial" | "analytical" | "periodic" | "operations" | "educational";

const typeBadgeClass: Record<ReportTypeKey, string> = {
  comprehensive: "bg-primary/10 text-primary border-primary/20",
  financial: "bg-success/12 text-success border-success/25",
  analytical: "bg-chart-4/12 text-chart-4 border-chart-4/25",
  periodic: "bg-warning/12 text-warning-foreground border-warning/25",
  operations: "bg-chart-2/12 text-chart-2 border-chart-2/25",
  educational: "bg-chart-1/12 text-chart-1 border-chart-1/25",
};

const REPORT_META = [
  { id: 1, typeKey: "comprehensive" as const, icon: Users, lastGenerated: "2024/03/15" },
  { id: 2, typeKey: "financial" as const, icon: Wallet, lastGenerated: "2024/03/14" },
  { id: 3, typeKey: "analytical" as const, icon: Activity, lastGenerated: "2024/03/13" },
  { id: 4, typeKey: "periodic" as const, icon: TrendingUp, lastGenerated: "2024/03/01" },
  { id: 5, typeKey: "operations" as const, icon: FileBarChart, lastGenerated: "2024/03/10" },
  { id: 6, typeKey: "educational" as const, icon: Calendar, lastGenerated: "2024/02/28" },
];

export default function ReportsPage() {
  const t = useTranslations("reports");

  const reports = useMemo(
    () =>
      REPORT_META.map((r) => ({
        ...r,
        title: t(`cards.r${r.id}_title`),
        description: t(`cards.r${r.id}_desc`),
      })),
    [t]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{t("title")}</h2>
          <p className="text-muted-foreground text-sm mt-1">{t("subtitle")}</p>
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder={t("filterPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filterAll")}</SelectItem>
            <SelectItem value="comprehensive">{t("types.comprehensive")}</SelectItem>
            <SelectItem value="financial">{t("types.financial")}</SelectItem>
            <SelectItem value="analytical">{t("types.analytical")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.id} className="border-0 shadow-sm hover:shadow-md transition-shadow group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-xl bg-primary/10 group-hover:scale-110 transition-transform">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <Badge variant="outline" className={typeBadgeClass[report.typeKey]}>
                    {t(`types.${report.typeKey}`)}
                  </Badge>
                </div>
                <CardTitle className="text-base mt-3">{report.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">{report.description}</p>
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    {t("lastGenerated", { date: report.lastGenerated })}
                  </span>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Download className="h-3.5 w-3.5" />
                    {t("exportExcel")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
