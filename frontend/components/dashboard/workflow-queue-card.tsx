"use client";

import * as React from "react";
import { Link } from "@/i18n/navigation";
import { ClipboardList } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

export type WorkflowQueueRow = {
  id: string;
  registration_number?: string | null;
  region?: string | null;
  vulnerabilityIndex: number;
  classification?: string | null;
  lastScoredAt?: string | null;
};

export interface WorkflowQueueCardProps {
  rows?: WorkflowQueueRow[];
  loading?: boolean;
}

export function WorkflowQueueCard({ rows = [], loading }: WorkflowQueueCardProps) {
  const t = useTranslations("dashboard");

  return (
    <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
      <CardHeader className="border-b bg-gradient-to-br from-[var(--muted)]/30 to-transparent pb-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              {t("workflow.queue_title")}
            </CardTitle>
            <CardDescription className="mt-1.5">{t("workflow.queue_hint")}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 max-h-[360px] overflow-y-auto space-y-2">
        {loading ? (
          <div className="space-y-2 py-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-xl w-full" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">{t("workflow.empty_queue")}</p>
        ) : (
          rows.map((r) => (
            <div
              key={r.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-xl border bg-card hover:bg-muted/40 transition-colors"
            >
              <div className="space-y-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  #{r.registration_number || r.id.slice(0, 8)}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                  <span>{r.region || t("regions.unknown_region")}</span>
                  {r.classification ? (
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {r.classification}
                    </Badge>
                  ) : null}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {t("workflow.vulnerability")}: <span dir="ltr" className="font-semibold">{r.vulnerabilityIndex.toFixed(2)}</span>
                </div>
              </div>
              <Button asChild variant="outline" size="sm" className="shrink-0 rounded-xl">
                <Link href={`/dashboard/families/${r.id}`}>{t("workflow.view_family")}</Link>
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
