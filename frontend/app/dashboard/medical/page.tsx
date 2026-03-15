"use client";

import { useState } from "react";
import {
  Stethoscope,
  Search,
  Plus,
  AlertCircle,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const medicalRecords = [
  { id: 1, family: "عائلة أحمد محمد", member: "أحمد محمد", condition: "ضغط دم مرتفع", severity: "متوسط", cost: 200, status: "مستمر" },
  { id: 2, family: "عائلة أحمد محمد", member: "فاطمة علي", condition: "سكري النوع الثاني", severity: "مزمن", cost: 450, status: "مستمر" },
  { id: 3, family: "عائلة فاطمة السيد", member: "فاطمة السيد", condition: "روماتيزم", severity: "متوسط", cost: 300, status: "مستمر" },
  { id: 4, family: "عائلة محمود علي", member: "محمود علي", condition: "كسر في الساق", severity: "حاد", cost: 1500, status: "علاج مؤقت" },
  { id: 5, family: "عائلة زينب عبدالرحمن", member: "علي زينب", condition: "إعاقة ذهنية", severity: "شديد", cost: 800, status: "مستمر" },
  { id: 6, family: "عائلة مريم أحمد", member: "مريم أحمد", condition: "أنيميا حادة", severity: "متوسط", cost: 250, status: "علاج مؤقت" },
];

const severityColors = {
  "متوسط": "bg-orange-100 text-orange-700 border-orange-200",
  "مزمن": "bg-red-100 text-red-700 border-red-200",
  "حاد": "bg-red-100 text-red-700 border-red-200",
  "شديد": "bg-red-200 text-red-800 border-red-300",
};

export default function MedicalPage() {
  const [search, setSearch] = useState("");
  const filtered = medicalRecords.filter(
    (r) => r.family.includes(search) || r.member.includes(search) || r.condition.includes(search)
  );

  const totalMonthlyCost = medicalRecords.reduce((s, r) => s + r.cost, 0);
  const criticalCount = medicalRecords.filter((r) => r.severity === "شديد" || r.severity === "مزمن").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">السجل الطبي</h2>
          <p className="text-muted-foreground text-sm mt-1">متابعة الحالات الطبية والعلاجية</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          إضافة سجل طبي
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Stethoscope className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">إجمالي الحالات</p>
              <p className="text-xl font-bold text-foreground">{medicalRecords.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-destructive/10">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">حالات حرجة</p>
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
              <p className="text-xs text-muted-foreground">التكلفة الشهرية</p>
              <p className="text-xl font-bold text-foreground">{totalMonthlyCost.toLocaleString("ar-EG")} ج.م</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث بالاسم أو الحالة..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-right">الأسرة</TableHead>
                <TableHead className="text-right">الفرد</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">الشدة</TableHead>
                <TableHead className="text-right">التكلفة الشهرية</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((record) => (
                <TableRow key={record.id} className="hover:bg-accent/50 transition-colors">
                  <TableCell className="font-medium">{record.family}</TableCell>
                  <TableCell>{record.member}</TableCell>
                  <TableCell>{record.condition}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={severityColors[record.severity]}>
                      {record.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>{record.cost.toLocaleString("ar-EG")} ج.م</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{record.status}</Badge>
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
