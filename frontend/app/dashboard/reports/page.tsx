"use client";

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

const reports = [
  {
    id: 1,
    title: "تقرير الأسر الشامل",
    description: "تقرير يحتوي على جميع بيانات الأسر المسجلة مع التصنيفات والمؤشرات",
    icon: Users,
    type: "شامل",
    lastGenerated: "2024/03/15",
  },
  {
    id: 2,
    title: "تقرير الدخل والمصروفات",
    description: "تحليل مفصل لمصادر الدخل والمصروفات الشهرية لجميع الأسر",
    icon: Wallet,
    type: "مالي",
    lastGenerated: "2024/03/14",
  },
  {
    id: 3,
    title: "تقرير مؤشرات الهشاشة",
    description: "تحليل مؤشرات الهشاشة والتصنيفات مع التوزيع الجغرافي",
    icon: Activity,
    type: "تحليلي",
    lastGenerated: "2024/03/13",
  },
  {
    id: 4,
    title: "تقرير الأداء الشهري",
    description: "ملخص النشاط الشهري من تسجيلات وزيارات ميدانية وتوزيعات",
    icon: TrendingUp,
    type: "دوري",
    lastGenerated: "2024/03/01",
  },
  {
    id: 5,
    title: "تقرير التوزيعات",
    description: "سجل كامل لجميع التوزيعات المادية والغذائية والعينية",
    icon: FileBarChart,
    type: "عمليات",
    lastGenerated: "2024/03/10",
  },
  {
    id: 6,
    title: "تقرير المتابعة التعليمية",
    description: "متابعة المستوى الدراسي لأبناء الأسر وحفظ القرآن",
    icon: Calendar,
    type: "تعليمي",
    lastGenerated: "2024/02/28",
  },
];

const typeColors = {
  "شامل": "bg-primary/10 text-primary border-primary/20",
  "مالي": "bg-green-50 text-green-600 border-green-200",
  "تحليلي": "bg-blue-50 text-blue-600 border-blue-200",
  "دوري": "bg-orange-50 text-orange-600 border-orange-200",
  "عمليات": "bg-purple-50 text-purple-600 border-purple-200",
  "تعليمي": "bg-cyan-50 text-cyan-600 border-cyan-200",
};

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">التقارير</h2>
          <p className="text-muted-foreground text-sm mt-1">إنشاء وتصدير التقارير المتنوعة</p>
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="نوع التقرير" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع التقارير</SelectItem>
            <SelectItem value="comprehensive">شامل</SelectItem>
            <SelectItem value="financial">مالي</SelectItem>
            <SelectItem value="analytical">تحليلي</SelectItem>
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
                  <Badge variant="outline" className={typeColors[report.type]}>{report.type}</Badge>
                </div>
                <CardTitle className="text-base mt-3">{report.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">{report.description}</p>
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">آخر إنشاء: {report.lastGenerated}</span>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Download className="h-3.5 w-3.5" />
                    تصدير Excel
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
