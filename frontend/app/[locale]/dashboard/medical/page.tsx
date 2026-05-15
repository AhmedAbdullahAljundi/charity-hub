"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Stethoscope,
  Search,
  Plus,
  AlertCircle,
  Activity,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatLocaleCurrency } from "@/lib/format/locale-format";
import type { AppLocale } from "@/lib/i18n/locales";

type SeverityStyleKey = "moderate" | "chronic" | "acute" | "severe";

const severityBadgeClass: Record<SeverityStyleKey, string> = {
  moderate: "bg-warning/12 text-warning-foreground border-warning/25",
  chronic: "bg-destructive/12 text-destructive border-destructive/25",
  acute: "bg-destructive/15 text-destructive border-destructive/30",
  severe: "bg-destructive/20 text-destructive border-destructive/35",
};

export default function MedicalPage() {
  const t = useTranslations("medical");
  const locale = useLocale() as AppLocale;
  const [search, setSearch] = useState("");

  const records = useMemo(
    () =>
      (
        [
          { id: 1, sk: "moderate" as const, cost: 200 },
          { id: 2, sk: "chronic" as const, cost: 450 },
          { id: 3, sk: "moderate" as const, cost: 300 },
          { id: 4, sk: "acute" as const, cost: 1500 },
          { id: 5, sk: "severe" as const, cost: 800 },
          { id: 6, sk: "moderate" as const, cost: 250 },
        ] as const
      ).map((row) => ({
        ...row,
        family: t(`demo.r${row.id}_family`),
        member: t(`demo.r${row.id}_member`),
        condition: t(`demo.r${row.id}_condition`),
        severityLabel: t(`demo.r${row.id}_severity`),
        statusLabel: t(`demo.r${row.id}_status`),
      })),
    [t]
  );

  const filtered = records.filter(
    (r) =>
      r.family.toLowerCase().includes(search.toLowerCase()) ||
      r.member.toLowerCase().includes(search.toLowerCase()) ||
      r.condition.toLowerCase().includes(search.toLowerCase())
  );

  const totalMonthlyCost = records.reduce((s, r) => s + r.cost, 0);
  const criticalCount = records.filter((r) => r.sk === "severe" || r.sk === "chronic").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{t("title")}</h2>
          <p className="text-muted-foreground text-sm mt-1">{t("subtitle")}</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          {t("addRecord")}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Stethoscope className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("stats.totalCases")}</p>
              <p className="text-xl font-bold text-foreground">{records.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-destructive/10">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("stats.criticalCases")}</p>
              <p className="text-xl font-bold text-foreground">{criticalCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-warning/10">
              <Activity className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("stats.monthlyCost")}</p>
              <p className="text-xl font-bold text-foreground">{formatLocaleCurrency(locale, totalMonthlyCost)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-start">{t("table.family")}</TableHead>
                <TableHead className="text-start">{t("table.member")}</TableHead>
                <TableHead className="text-start">{t("table.condition")}</TableHead>
                <TableHead className="text-start">{t("table.severity")}</TableHead>
                <TableHead className="text-start">{t("table.cost")}</TableHead>
                <TableHead className="text-start">{t("table.status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((record) => (
                <TableRow key={record.id} className="hover:bg-accent/50 transition-colors">
                  <TableCell className="font-medium">{record.family}</TableCell>
                  <TableCell>{record.member}</TableCell>
                  <TableCell>{record.condition}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={severityBadgeClass[record.sk]}>
                      {record.severityLabel}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatLocaleCurrency(locale, record.cost)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{record.statusLabel}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
