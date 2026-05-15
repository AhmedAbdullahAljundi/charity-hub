"use client";

import { Link } from "@/i18n/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocale, useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { classificationBadgeVariant } from "@/lib/dashboard-classification-badge";

export interface PriorityFamilyRow {
  id: string;
  registration_number?: string | null;
  region?: string | null;
  classification?: string | null;
  vulnerabilityIndex: number;
}

interface PriorityFamiliesTableProps {
  rows: PriorityFamilyRow[];
  loading?: boolean;
}

export function PriorityFamiliesTable({ rows, loading }: PriorityFamiliesTableProps) {
  const locale = useLocale();
  const t = useTranslations("dashboard");
  const Chevron = locale === "ar" ? ChevronLeft : ChevronRight;

  return (
    <Card className="rounded-lg border border-border/50 shadow-sm">
      <CardHeader className="border-b border-border/35 py-2.5 px-3">
        <CardTitle className="text-[11px] font-bold text-foreground">{t("tables.highest_need_title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-0 p-0">
        <div className="overflow-x-auto">
          {loading ? (
            <Skeleton className="h-32 w-full rounded-none" />
          ) : rows.length === 0 ? (
            <p className="px-3 py-6 text-center text-[11px] text-muted-foreground">{t("tables.empty_priority")}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="h-8 hover:bg-transparent">
                  <TableHead className="text-[10px] font-semibold uppercase text-muted-foreground">{t("tables.registration")}</TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase text-muted-foreground">{t("tables.classification")}</TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase text-muted-foreground">{t("tables.need_index")}</TableHead>
                  <TableHead className="w-[100px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id} className="h-9 border-border/30 hover:bg-muted/30">
                    <TableCell dir="ltr" className="py-1.5 text-xs font-semibold">
                      {row.registration_number || row.id.slice(0, 8)}
                    </TableCell>
                    <TableCell className="py-1.5">
                      <Badge
                        variant={classificationBadgeVariant(row.classification)}
                        className="font-mono text-[10px] px-1.5 py-0"
                      >
                        {row.classification ?? "—"}
                      </Badge>
                    </TableCell>
                    <TableCell dir="ltr" className="py-1.5 text-xs font-bold tabular-nums">
                      {row.vulnerabilityIndex.toFixed(2)}
                    </TableCell>
                    <TableCell className="py-1.5">
                      <Button asChild size="sm" variant="secondary" className="h-7 rounded-md px-2 text-[10px]">
                        <Link href={`/dashboard/families/${row.id}`}>{t("tables.action_open")}</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        <div className="border-t border-border/35 px-3 py-2">
          <Link
            href="/dashboard/families"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
          >
            {t("common.view_all")}
            <Chevron className="size-3 opacity-70" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
