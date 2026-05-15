"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  GraduationCap,
  Search,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
import { formatLocaleNumber } from "@/lib/format/locale-format";
import type { AppLocale } from "@/lib/i18n/locales";

function getGpaColor(gpa: number) {
  if (gpa >= 85) return "text-success";
  if (gpa >= 70) return "text-chart-4";
  if (gpa >= 50) return "text-warning-foreground";
  return "text-destructive";
}

export default function EducationPage() {
  const t = useTranslations("education");
  const locale = useLocale() as AppLocale;
  const [search, setSearch] = useState("");

  const students = useMemo(
    () =>
      [1, 2, 3, 4, 5, 6].map((n) => ({
        id: n,
        name: t(`demo.s${n}_name`),
        family: t(`demo.s${n}_family`),
        grade: t(`demo.s${n}_grade`),
        gpa: [82, 91, 74, 88, 95, 67][n - 1],
        quranLevel: t(`demo.s${n}_quran`),
        lastUpdate: ["2024/03", "2024/03", "2024/02", "2024/03", "2024/03", "2024/02"][n - 1],
      })),
    [t]
  );

  const getGpaLabel = (gpa: number) => {
    if (gpa >= 85) return t("levels.excellent");
    if (gpa >= 70) return t("levels.veryGood");
    if (gpa >= 50) return t("levels.good");
    return t("levels.weak");
  };

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.family.toLowerCase().includes(search.toLowerCase()) ||
      s.grade.toLowerCase().includes(search.toLowerCase())
  );

  const avgGpa = Math.round(students.reduce((sum, st) => sum + st.gpa, 0) / students.length);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">{t("title")}</h2>
        <p className="text-muted-foreground text-sm mt-1">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("stats.totalStudents")}</p>
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
              <p className="text-xs text-muted-foreground">{t("stats.averageGrades")}</p>
              <p className="text-xl font-bold text-foreground">
                {formatLocaleNumber(locale, avgGpa, { maximumFractionDigits: 0 })}%
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-warning/10">
              <BookOpen className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("stats.topPerformers")}</p>
              <p className="text-xl font-bold text-foreground">{students.filter((s) => s.gpa >= 85).length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-start">{t("table.student")}</TableHead>
                <TableHead className="text-start">{t("table.family")}</TableHead>
                <TableHead className="text-start">{t("table.grade")}</TableHead>
                <TableHead className="text-start">{t("table.level")}</TableHead>
                <TableHead className="text-start">{t("table.quran")}</TableHead>
                <TableHead className="text-start">{t("table.updated")}</TableHead>
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
                        {formatLocaleNumber(locale, student.gpa, { maximumFractionDigits: 0 })}%
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
                  <TableCell className="text-muted-foreground text-sm" dir="ltr">
                    {student.lastUpdate}
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
