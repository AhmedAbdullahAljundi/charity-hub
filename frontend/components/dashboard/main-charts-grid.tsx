"use client";

import { useDashboardStore } from "@/lib/stores/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, LineChart, Line,
} from "recharts";

const ELIGIBILITY_COLORS: Record<string, string> = {
  CRITICAL: "#e11d48",
  HIGH_NEED: "#ea580c",
  MODERATE_NEED: "#ca8a04",
  LOW_NEED: "#2563eb",
  NOT_ELIGIBLE: "#64748b",
};

const ELIGIBILITY_LABELS: Record<string, string> = {
  CRITICAL: "حرجة جداً",
  HIGH_NEED: "احتياج عالي",
  MODERATE_NEED: "احتياج متوسط",
  LOW_NEED: "احتياج منخفض",
  NOT_ELIGIBLE: "غير مستحق",
};

export function MainChartsGrid() {
  const { familyClassification, regionsOverview, monthlySeries, loadingDashboard } =
    useDashboardStore();

  // Chart 1 — توزيع درجات الاستحقاق من familyClassification
  const distChartData = (familyClassification ?? []).map((d: any) => ({
    name: ELIGIBILITY_LABELS[d.classificationKey] || d.classificationKey || "—",
    count: Number(d.value ?? 0),
    level: d.classificationKey,
  }));

  // Chart 2 — متوسط الاستحقاق الإقليمي من regionsOverview (أعلى 8)
  const regData = [...(regionsOverview ?? [])]
    .sort((a, b) => (b.averageVulnerability || 0) - (a.averageVulnerability || 0))
    .slice(0, 8)
    .map((r) => ({
      governorate: (r.region === "__UNSPECIFIED" || r.region === "غير محدد") ? "غير محدد" : r.region,
      avgPercent: Number((r.averageVulnerability || 0).toFixed(1)),
    }));

  // Chart 3 — اتجاه الاستحقاق من monthlySeries (خطوط)
  const trendData = (monthlySeries ?? []).map((row: any) => ({
    month: row.monthLabelShort || row.month || "",
    income: Number(row.householdIncome ?? 0),
    expenses: Number(row.householdExpenses ?? 0),
    medical: Number(row.medicalSpend ?? 0),
  }));

  if (loadingDashboard) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="py-3 bg-muted/20">
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent className="p-4 h-[300px]">
              <Skeleton className="w-full h-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* CHART 1 — توزيع درجات الاستحقاق */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-3 bg-muted/20">
          <CardTitle className="text-sm font-bold">توزيع درجات الاستحقاق</CardTitle>
        </CardHeader>
        <CardContent className="p-4 h-[300px]" dir="ltr">
          {distChartData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              لا توجد بيانات تصنيف
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={{ borderRadius: "8px", fontSize: "12px", direction: "rtl" }}
                />
                <Bar dataKey="count" name="عدد الأسر" radius={[4, 4, 0, 0]}>
                  {distChartData.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={ELIGIBILITY_COLORS[entry.level] || "#cbd5e1"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* CHART 2 — التوزيع الجغرافي للدرجات */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-3 bg-muted/20">
          <CardTitle className="text-sm font-bold">التوزيع الجغرافي للدرجات</CardTitle>
        </CardHeader>
        <CardContent className="p-4 h-[300px]" dir="ltr">
          {regData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              لا توجد بيانات إقليمية
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={regData}
                layout="vertical"
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="governorate" tick={{ fontSize: 10 }} width={80} />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={{ borderRadius: "8px", fontSize: "12px", direction: "rtl" }}
                />
                <Bar dataKey="avgPercent" name="متوسط الاستحقاق %" radius={[0, 4, 4, 0]}>
                  {regData.map((entry: any, index: number) => {
                    const color =
                      entry.avgPercent > 70
                        ? "#e11d48"
                        : entry.avgPercent > 40
                          ? "#ca8a04"
                          : "#2563eb";
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* CHART 3 — الدخل والمصروفات الشهرية */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-3 bg-muted/20">
          <CardTitle className="text-sm font-bold">الدخل والمصروفات الشهرية</CardTitle>
        </CardHeader>
        <CardContent className="p-4 h-[300px]" dir="ltr">
          {trendData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              لا توجد بيانات شهرية
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{ borderRadius: "8px", fontSize: "12px", direction: "rtl" }}
                />
                <Legend wrapperStyle={{ fontSize: "10px" }} />
                <Line
                  type="monotone"
                  dataKey="income"
                  name="دخل الأسر"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  name="المصروفات"
                  stroke="#e11d48"
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="medical"
                  name="الصرف الطبي"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* CHART 4 — الحالات الحرجة حسب المحافظة */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-3 bg-muted/20">
          <CardTitle className="text-sm font-bold">الحالات الحرجة حسب المحافظة</CardTitle>
        </CardHeader>
        <CardContent className="p-4 h-[300px]" dir="ltr">
          {regData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              لا توجد بيانات
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[...(regionsOverview ?? [])]
                  .sort((a, b) => (b.criticalCases || 0) - (a.criticalCases || 0))
                  .slice(0, 8)
                  .map((r) => ({
                    name: r.region === "__UNSPECIFIED" ? "غير محدد" : r.region,
                    critical: r.criticalCases || 0,
                    total: r.familiesCount || 0,
                  }))}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={{ borderRadius: "8px", fontSize: "12px", direction: "rtl" }}
                />
                <Legend wrapperStyle={{ fontSize: "10px" }} />
                <Bar dataKey="critical" name="حرجة" fill="#e11d48" radius={[4, 4, 0, 0]} />
                <Bar dataKey="total" name="إجمالي" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
