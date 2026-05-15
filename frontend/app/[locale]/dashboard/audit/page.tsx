"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  Calendar,
  FileText,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type AuditTypeKey = "add" | "edit" | "research" | "report" | "disbursement" | "refresh";

const typeBadgeClass: Record<AuditTypeKey, string> = {
  add: "bg-success/12 text-success border-success/25",
  edit: "bg-chart-4/12 text-chart-4 border-chart-4/25",
  research: "bg-chart-2/12 text-chart-2 border-chart-2/25",
  report: "bg-warning/12 text-warning-foreground border-warning/25",
  disbursement: "bg-chart-1/12 text-chart-1 border-chart-1/25",
  refresh: "bg-warning/10 text-warning-foreground border-warning/20",
};

export default function AuditPage() {
  const t = useTranslations("audit");

  const auditLogs = useMemo(
    () =>
      (
        [
          { id: 1, typeKey: "add" as const },
          { id: 2, typeKey: "edit" as const },
          { id: 3, typeKey: "research" as const },
          { id: 4, typeKey: "add" as const },
          { id: 5, typeKey: "report" as const },
          { id: 6, typeKey: "disbursement" as const },
          { id: 7, typeKey: "edit" as const },
          { id: 8, typeKey: "refresh" as const },
        ] as const
      ).map((row) => ({
        ...row,
        user: t(`demo.l${row.id}_user`),
        action: t(`demo.l${row.id}_action`),
        target: t(`demo.l${row.id}_target`),
        timestamp: [
          "2024/03/15 - 10:30",
          "2024/03/15 - 09:15",
          "2024/03/14 - 16:45",
          "2024/03/14 - 14:20",
          "2024/03/14 - 11:00",
          "2024/03/13 - 15:30",
          "2024/03/13 - 10:00",
          "2024/03/12 - 13:45",
        ][row.id - 1],
      })),
    [t]
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">{t("title")}</h2>
        <p className="text-muted-foreground text-sm mt-1">{t("subtitle")}</p>
      </div>

      <div className="space-y-3">
        {auditLogs.map((log) => (
          <Card key={log.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                    {log.user[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="font-semibold text-foreground text-sm">{log.user}</span>
                    <span className="text-muted-foreground text-sm">{log.action}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-foreground/80 truncate">{log.target}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <Badge variant="outline" className={typeBadgeClass[log.typeKey]}>
                    {t(`types.${log.typeKey}`)}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span dir="ltr">{log.timestamp}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
