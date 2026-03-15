"use client";

import { useState } from "react";
import {
  GraduationCap,
  Search,
  BookOpen,
  Trophy,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const students = [
  { id: 1, name: "محمد أحمد", family: "عائلة أحمد محمد", grade: "الصف الأول الثانوي", gpa: 82, quranLevel: "سورة البقرة", lastUpdate: "2024/03" },
  { id: 2, name: "سارة أحمد", family: "عائلة أحمد محمد", grade: "الصف السادس الابتدائي", gpa: 91, quranLevel: "سورة آل عمران", lastUpdate: "2024/03" },
  { id: 3, name: "علي فاطمة", family: "عائلة فاطمة السيد", grade: "الصف الثالث الإعدادي", gpa: 74, quranLevel: "سورة النساء", lastUpdate: "2024/02" },
  { id: 4, name: "نور محمود", family: "عائلة محمود علي", grade: "الصف الثاني الابتدائي", gpa: 88, quranLevel: "جزء عم", lastUpdate: "2024/03" },
  { id: 5, name: "ياسمين محمود", family: "عائلة محمود علي", grade: "الصف الرابع الابتدائي", gpa: 95, quranLevel: "سورة يس", lastUpdate: "2024/03" },
  { id: 6, name: "أحمد حسن", family: "عائلة حسن محمد", grade: "الصف الثاني الثانوي", gpa: 67, quranLevel: "سورة الكهف", lastUpdate: "2024/02" },
];

function getGpaColor(gpa) {
  if (gpa >= 85) return "text-green-600";
  if (gpa >= 70) return "text-blue-600";
  if (gpa >= 50) return "text-orange-600";
  return "text-red-600";
}

function getGpaLabel(gpa) {
  if (gpa >= 85) return "ممتاز";
  if (gpa >= 70) return "جيد جداً";
  if (gpa >= 50) return "جيد";
  return "ضعيف";
}

export default function EducationPage() {
  const [search, setSearch] = useState("");
  const filtered = students.filter(
    (s) => s.name.includes(search) || s.family.includes(search) || s.grade.includes(search)
  );

  const avgGpa = Math.round(students.reduce((s, st) => s + st.gpa, 0) / students.length);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">المتابعة التعليمية</h2>
        <p className="text-muted-foreground text-sm mt-1">متابعة المستوى الدراسي وحفظ القرآن</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">إجمالي الطلاب</p>
              <p className="text-xl font-bold text-foreground">{students.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-chart-4/10">
              <TrendingUp className="h-5 w-5 text-chart-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">متوسط الدرجات</p>
              <p className="text-xl font-bold text-foreground">{avgGpa}%</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-warning/10">
              <BookOpen className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">المتفوقون</p>
              <p className="text-xl font-bold text-foreground">{students.filter((s) => s.gpa >= 85).length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث بالاسم أو الأسرة أو المرحلة..."
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
                <TableHead className="text-right">اسم الطالب</TableHead>
                <TableHead className="text-right">الأسرة</TableHead>
                <TableHead className="text-right">المرحلة الدراسية</TableHead>
                <TableHead className="text-right">المستوى</TableHead>
                <TableHead className="text-right">حفظ القرآن</TableHead>
                <TableHead className="text-right">آخر تحديث</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((student) => (
                <TableRow key={student.id} className="hover:bg-accent/50 transition-colors">
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{student.family}</TableCell>
                  <TableCell>{student.grade}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={student.gpa} className="h-2 w-16" />
                      <span className={`text-sm font-bold ${getGpaColor(student.gpa)}`}>
                        {student.gpa}%
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {getGpaLabel(student.gpa)}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5 text-primary" />
                      <span className="text-sm">{student.quranLevel}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{student.lastUpdate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
