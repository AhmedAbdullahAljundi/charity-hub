"use client";

import {
  Users,
  HandCoins,
  Wallet,
  Activity,
  HeartPulse,
  AlertTriangle,
  FileWarning
} from "lucide-react";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedCounter } from "@/components/animated-counter";
import { useDashboardStore } from "@/lib/store";
import { DashboardCharts } from "@/components/dashboard-charts";

const statCards = [
  {
    key: "totalFamilies",
    label: "الأسر المضافة",
    icon: Users,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    key: "criticalFamilies",
    label: "الأسر الحرجة المحتاجة",
    icon: AlertTriangle,
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
  {
    key: "incompleteFamilies",
    label: "أسر غير مكتملة",
    icon: FileWarning,
    color: "text-warning",
    bg: "bg-warning/10",
  },
  {
    key: "totalNeed",
    label: "إجمالي الاحتياج",
    icon: HandCoins,
    suffix: " ج.م",
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
  {
    key: "totalIncome",
    label: "إجمالي الدخل",
    icon: Wallet,
    suffix: " ج.م",
    color: "text-chart-1",
    bg: "bg-chart-1/10",
  },
];

export default function DashboardPage() {
  const { stats, fetchStats } = useDashboardStore();

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">لوحة التحكم</h2>
        <p className="text-muted-foreground text-sm mt-1">نظرة عامة على أداء النظام والإحصائيات</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          const val = stats[card.key] ?? 0;
          return (
            <Card
              key={card.key}
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 border-0 shadow-sm"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">{card.label}</p>
                    <p className="text-2xl font-bold text-foreground">
                      {(card as any).isFloat ? (
                        <AnimatedCounter value={Math.round(val * 100)} suffix="%" />
                      ) : (
                        <AnimatedCounter value={val} suffix={card.suffix || ""} />
                      )}
                    </p>
                  </div>
                  <div className={`p-2.5 rounded-xl ${card.bg} transition-transform group-hover:scale-110`}>
                    <Icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <DashboardCharts />
    </div>
  );
}
