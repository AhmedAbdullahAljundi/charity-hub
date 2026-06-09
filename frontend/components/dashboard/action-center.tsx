"use client";

import { Link } from "@/i18n/navigation";
import { Users, ClipboardPlus, Activity, PieChartIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export function ActionCenter() {
  const t = useTranslations("dashboard");

  return (
    <Card className="border-0 shadow-md rounded-2xl bg-muted/35">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg gap-3 flex flex-wrap items-center leading-tight">
          <PieChartIcon className="h-5 w-5 text-primary shrink-0" />
          <span suppressHydrationWarning>{t("sections.action_center")}</span>
        </CardTitle>
        <CardDescription className="leading-relaxed">{t("action.export_hint")}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 pb-8">
        <Button asChild className="h-auto rounded-2xl text-start px-6 py-5 flex-col items-start shadow-sm gap-4 bg-background hover:bg-background/92 border hover:border-primary/40 transition-colors">
          <Link href="/dashboard/households/new">
            <div className="flex items-start gap-3 w-full justify-between">
              <div className="space-y-1 text-start rtl:text-start">
                <p className="text-xs uppercase font-bold text-muted-foreground tracking-wider">{t("action.open_intake_route")}</p>
                <p className="text-sm font-semibold text-foreground leading-snug">{t("action.register_family")}</p>
              </div>
              <ClipboardPlus className="h-5 w-5 text-primary shrink-0" />
            </div>
          </Link>
        </Button>
        <Button asChild variant="secondary" className="h-auto rounded-2xl px-6 py-5 flex-col shadow-sm hover:shadow-lg transition-all">
          <Link href="/dashboard/households">
            <div className="flex gap-4 items-start rtl:flex-row-reverse w-full">
              <Users className="h-8 w-8 text-muted-foreground" />
              <div className="text-start rtl:text-start space-y-1">
                <p className="text-sm font-semibold">{t("action.families_board")}</p>
                <p className="text-xs text-muted-foreground leading-snug">{t("sections.family_stats")}</p>
              </div>
            </div>
          </Link>
        </Button>
        <Button asChild variant="secondary" className="h-auto rounded-2xl px-6 py-5 shadow-sm hover:shadow-lg transition-all flex-col rtl:text-start rtl:items-start">
          <Link href="/dashboard/medical">
            <div className="flex gap-4 items-start w-full rtl:flex-row-reverse">
              <Activity className="h-8 w-8 text-muted-foreground" />
              <div className="text-start rtl:text-start space-y-1">
                <p className="text-sm font-semibold">{t("action.medical_dashboard")}</p>
                <p className="text-[11px] text-muted-foreground leading-snug">{t("financial.medical_exposure")}</p>
              </div>
            </div>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto rounded-2xl px-6 py-5 border-dashed border-primary/55 shadow-sm rtl:text-start">
          <Link href="/dashboard/reports">
            <div className="space-y-1 text-start rtl:text-start">
              <p className="text-sm font-semibold">{t("action.reports_placeholder")}</p>
              <p className="text-[11px] text-muted-foreground leading-snug italic">{t("action.export_hint")}</p>
            </div>
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
