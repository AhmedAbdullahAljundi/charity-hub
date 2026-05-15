"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { LucideIcon } from "lucide-react";

export interface DashboardKpiCardProps {
  label: React.ReactNode;
  value: React.ReactNode;
  icon: LucideIcon;
  accentClass?: string;
  chip?: React.ReactNode;
  footer?: React.ReactNode;
  loading?: boolean;
  className?: string;
}

export function DashboardKpiCard({
  label,
  value,
  icon: Icon,
  accentClass = "bg-primary/10 text-primary",
  chip,
  footer,
  loading,
  className,
}: DashboardKpiCardProps) {
  if (loading) {
    return (
      <Card className={cn("border-0 shadow-sm overflow-hidden rounded-2xl", className)}>
        <CardContent className="p-5 space-y-3">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    );
  }
  return (
    <Card
      className={cn(
        "group border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 rounded-2xl overflow-hidden bg-card",
        className
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground leading-tight">
                {label}
              </p>
              {chip}
            </div>
            <div className="text-2xl md:text-[1.65rem] font-bold font-tabular-nums tracking-tight text-foreground truncate">
              {value}
            </div>
            {footer ? <div className="text-xs text-muted-foreground pt-2">{footer}</div> : null}
          </div>
          <div className={cn("p-2.5 rounded-xl shrink-0 transition-transform group-hover:scale-105", accentClass)}>
            <Icon className="h-5 w-5" aria-hidden />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
