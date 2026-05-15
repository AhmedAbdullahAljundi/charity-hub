"use client";

import { Link } from "@/i18n/navigation";
import { Users, ClipboardPlus, Activity, FileBarChart } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function DashboardQuickLinks() {
  const t = useTranslations("dashboard");

  const links = [
    { href: "/dashboard/families", label: t("action.register_family"), icon: ClipboardPlus },
    { href: "/dashboard/families", label: t("action.families_board"), icon: Users },
    { href: "/dashboard/medical", label: t("action.medical_dashboard"), icon: Activity },
    { href: "/dashboard/reports", label: t("action.reports_placeholder"), icon: FileBarChart },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {links.map((l) => {
        const Icon = l.icon;
        return (
          <Button key={l.href + l.label} variant="outline" size="sm" className="h-8 rounded-lg text-xs gap-1.5 border-border/60" asChild>
            <Link href={l.href}>
              <Icon className="size-3.5 opacity-70" />
              {l.label}
            </Link>
          </Button>
        );
      })}
    </div>
  );
}
