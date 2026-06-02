"use client";

import React, { Suspense, useEffect, useState } from "react";
import { GraduationCap, Star, TrendingUp, BookOpen, AlertCircle, Plus, Search, X, Download, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import * as XLSX from "xlsx";
import { useEducationStore } from "@/lib/stores/educationStore";
import { listEducationRecords } from "@/lib/api/education-api";
import { cn } from "@/lib/utils";
import EducationTable from "@/components/education/EducationTable";
import dynamic from "next/dynamic";

const StudentRecordModal = dynamic(
  () => import("@/components/education/StudentRecordModal"),
  { ssr: false }
);

const levelOptions = [
  "NONE", "KINDERGARTEN", "PRIMARY", "PREPARATORY",
  "SECONDARY_GENERAL", "SECONDARY_INDUSTRIAL_COMMERCIAL_BOYS", "SECONDARY_INDUSTRIAL_COMMERCIAL_GIRLS",
  "UNIVERSITY_SCIENTIFIC", "UNIVERSITY_THEORETICAL", "SPECIAL_EDUCATION"
];

const gradeOptions = [
  "FAIL", "PASS", "GOOD", "VERY_GOOD", "EXCELLENT"
];

const classificationOptions = [
  "أيتام", "فقراء", "مساكين", "أرامل", "ذوي الاحتياجات", "غارمين", "مطلقات"
];

const quranRangeOptions = [
  { value: "0-0", label: "غير مسجل" },
  { value: "0.5-5", label: "أقل من 5 أجزاء" },
  { value: "5-10", label: "5-10 أجزاء" },
  { value: "10-20", label: "10-20 جزء" },
  { value: "20-30", label: "20-30 جزء" },
];

function EducationContent() {
  const t = useTranslations("education");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { list, kpis, loading, pagination, fetchList, fetchKpis } = useEducationStore();

  const currentSearch = searchParams.get("search") || "";
  const currentLevel = searchParams.get("studentLevel") || "";
  const currentGrade = searchParams.get("overallGrade") || "";
  const currentClassification = searchParams.get("classification") || "";
  const currentQuranRange = searchParams.get("quranRange") || "";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const currentSort = searchParams.get("sort") || "";

  const [searchValue, setSearchValue] = useState(currentSearch);
  const [modalOpen, setModalOpen] = useState(false);

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    
    if (key === "quranRange") {
        if (value) {
            const [min, max] = value.split("-");
            if (min === "0" && max === "0") {
                params.set("quranProgressMax", "0");
                params.delete("quranProgressMin");
            } else {
                params.set("quranProgressMin", (parseFloat(min) / 30 * 100).toString());
                params.set("quranProgressMax", (parseFloat(max) / 30 * 100).toString());
            }
        } else {
            params.delete("quranProgressMin");
            params.delete("quranProgressMax");
        }
    }
    
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (searchValue !== currentSearch) {
        const params = new URLSearchParams(searchParams.toString());
        if (searchValue) params.set("search", searchValue);
        else params.delete("search");
        params.delete("page");
        router.replace(`${pathname}?${params.toString()}`);
      }
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [searchValue, currentSearch, pathname, router, searchParams]);

  useEffect(() => {
    const quranParams: any = {};
    if (currentQuranRange) {
        const [min, max] = currentQuranRange.split("-");
        if (min === "0" && max === "0") {
            quranParams.quranProgressMax = "0";
        } else {
            quranParams.quranProgressMin = (parseFloat(min) / 30 * 100).toString();
            quranParams.quranProgressMax = (parseFloat(max) / 30 * 100).toString();
        }
    }

    void fetchList({
      page: currentPage,
      limit: 12,
      search: currentSearch || undefined,
      studentLevel: currentLevel || undefined,
      overallGrade: currentGrade || undefined,
      classification: currentClassification || undefined,
      sort: currentSort || undefined,
      ...quranParams
    });
  }, [fetchList, currentPage, currentSearch, currentLevel, currentGrade, currentClassification, currentQuranRange, currentSort]);

  useEffect(() => {
    void fetchKpis();
  }, [fetchKpis]);

  const getExportData = async () => {
    const quranParams: any = {};
    if (currentQuranRange) {
        const [min, max] = currentQuranRange.split("-");
        if (min === "0" && max === "0") {
            quranParams.quranProgressMax = "0";
        } else {
            quranParams.quranProgressMin = (parseFloat(min) / 30 * 100).toString();
            quranParams.quranProgressMax = (parseFloat(max) / 30 * 100).toString();
        }
    }
    const params = {
      page: 1,
      limit: 10000,
      search: currentSearch || undefined,
      studentLevel: currentLevel || undefined,
      overallGrade: currentGrade || undefined,
      classification: currentClassification || undefined,
      sort: currentSort || undefined,
      ...quranParams
    };
    const result = await listEducationRecords(params);
    return result.data;
  };

  const exportExcel = async () => {
    const data = await getExportData();
    const headers = [
      "رقم القيد", "اسم الطالب", "الرقم القومي", "الهاتف", "السنة الدراسية", "المرحلة", 
      "راسب", "المتوسط الدراسي", "التقدير", "حفظ القرآن (جزء)", "درجة الحفظ", 
      "أيام الغياب", "التقييم الكلي"
    ];
    
    const rows = data.map((r) => [
      r.household?.code || "",
      r.person?.name || "",
      r.person?.nationalId || "",
      r.household?.primaryPhone || "",
      r.academicYear || "",
      r.studentLevel ? t(`levels.${r.studentLevel}`) : "",
      r.isRepeating ? "نعم" : "لا",
      r.averageScore ?? "",
      r.overallGrade ? t(`grades.${r.overallGrade}`) : "",
      r.quranJuzCount ?? "",
      r.quranGrade ?? "",
      r.quranAttendancePercent ?? "",
      r.totalScore ?? ""
    ]);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
      ["CharityHub — المتابعة التعليمية"],
      [`تاريخ التصدير: ${new Date().toLocaleDateString("ar-EG")} | إجمالي الطلاب: ${data.length}`],
      headers,
      ...rows
    ]);
    
    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 12 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 12 } }
    ];

    wb.Workbook = { Views: [{ RTL: true }] };
    XLSX.utils.book_append_sheet(wb, ws, "Education");
    XLSX.writeFile(wb, `Education-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const dummyCounts = new Map<string, number>();

  return (
    <div className="grid h-[calc(100vh-6rem)] min-h-0 grid-rows-[auto_auto_1fr_auto] gap-3 overflow-hidden bg-[var(--page-bg)] text-[var(--text-primary)] [--border-subtle:#F1F5F9] [--border:#E2E8F0] [--brand-dark:#16A34A] [--brand:#22C55E] [--page-bg:#F8FAFC] [--surface-raised:#F1F5F9] [--surface:#FFFFFF] [--text-muted:#94A3B8] [--text-primary:#0F172A] [--text-secondary:#475569] dark:[--border-subtle:#1E293B] dark:[--border:#334155] dark:[--brand-dark:#4ADE80] dark:[--brand:#22C55E] dark:[--page-bg:#0F172A] dark:[--surface-raised:#334155] dark:[--surface:#1E293B] dark:[--text-muted:#475569] dark:[--text-primary:#F1F5F9] dark:[--text-secondary:#94A3B8] lg:h-[calc(100vh-7rem)]">
      
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <KpiCard icon={GraduationCap} label={t("kpi.total")} value={kpis?.totalStudents || 0} accent="#22C55E" />
        <KpiCard icon={Star} label={t("kpi.excellent")} value={kpis?.excellentCount || 0} accent="#10B981" />
        <KpiCard icon={TrendingUp} label={t("kpi.avgScore")} value={kpis?.avgTotalScore || 0} accent="#3B82F6" />
        <KpiCard icon={BookOpen} label={t("kpi.quranStudents")} value={kpis?.quranStudentsCount || 0} accent="#F59E0B" />
        <KpiCard icon={AlertCircle} label="عدد الراسبين" value={kpis?.failingCount || 0} accent="#F43F5E" />
        <KpiCard icon={AlertCircle} label={t("kpi.needsUpdate")} value={kpis?.needsUpdateCount || 0} accent="#64748B" />
      </div>

      <div className="flex min-h-12 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
        <Button onClick={() => setModalOpen(true)} className="h-9 shrink-0 rounded-lg bg-[var(--brand)] px-3 text-white hover:bg-[var(--brand-dark)]">
          <Plus className="ms-1 h-4 w-4" />
          {t("addBtn")}
        </Button>

        <FilterPopover
          name={t("filters.level")}
          selected={currentLevel}
          options={levelOptions.map(l => ({ value: l, label: t(`levels.${l}`), dot: "bg-blue-400" }))}
          counts={kpis?.levelBreakdown ? new Map(Object.entries(kpis.levelBreakdown)) : new Map()}
          onChange={(value) => updateFilters("studentLevel", value)}
        />
        <FilterPopover
          name={t("filters.grade")}
          selected={currentGrade}
          options={gradeOptions.map(g => ({ value: g, label: t(`grades.${g}`), dot: "bg-green-400" }))}
          counts={dummyCounts}
          onChange={(value) => updateFilters("overallGrade", value)}
        />
        <FilterPopover
          name={t("filters.classification")}
          selected={currentClassification}
          options={classificationOptions.map((label) => ({ value: label, label: t(`classifications.${label}`), dot: "bg-slate-400" }))}
          counts={kpis?.classificationBreakdown ? new Map(Object.entries(kpis.classificationBreakdown)) : new Map()}
          onChange={(value) => updateFilters("classification", value)}
        />
        <FilterPopover
          name={t("filters.quranRange")}
          selected={currentQuranRange}
          options={quranRangeOptions.map(o => ({ ...o, dot: "bg-amber-400" }))}
          counts={dummyCounts}
          onChange={(value) => updateFilters("quranRange", value)}
        />

        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <Input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder={t("searchPlaceholder")}
            className="h-9 rounded-lg border-[var(--border)] bg-[var(--surface)] pr-9 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => setSearchValue("")}
              className="absolute left-2 top-1/2 rounded-full p-1 text-[var(--text-muted)] hover:bg-[var(--surface-raised)]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-9 rounded-lg border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)]">
              <Download className="ms-1 h-4 w-4" />
              {t("export")}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => void exportExcel()}>Excel</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <EducationTable
        list={list}
        loading={loading}
        pagination={pagination}
        searchQuery={currentSearch}
      />
      
      {modalOpen && (
        <StudentRecordModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          onSaved={() => {
            setModalOpen(false);
            fetchList({
              page: currentPage,
              limit: 12,
              search: currentSearch || undefined,
              studentLevel: currentLevel || undefined,
              overallGrade: currentGrade || undefined,
              classification: currentClassification || undefined,
              sort: currentSort || undefined,
            });
            fetchKpis();
          }}
        />
      )}
    </div>
  );
}

function FilterPopover({
  name,
  selected,
  options,
  counts,
  onChange,
}: {
  name: string;
  selected: string;
  options: Array<{ value: string; label: string; dot: string }>;
  counts: Map<string, number>;
  onChange: (value: string) => void;
}) {
  const selectedOption = options.find((option) => option.value === selected);
  const label = selectedOption ? `${name}: ${selectedOption.label}` : name;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border px-3 text-sm transition-colors hover:bg-[var(--surface-raised)]",
            selected
              ? "border-green-500 bg-[var(--surface)] text-green-700 font-medium dark:border-green-400 dark:text-green-300"
              : "border-[var(--border)] bg-[var(--surface)] text-slate-500 dark:text-slate-200"
          )}
        >
          {label}
          {selected && (
            <span
              role="button"
              tabIndex={0}
              onClick={(event) => {
                event.stopPropagation();
                onChange("");
              }}
              className="rounded-full p-0.5 text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900/50"
            >
              <X className="h-3 w-3" />
            </span>
          )}
          {!selected && <ChevronDown className="h-3.5 w-3.5 opacity-50" />}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-1">
        <button
          className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
          onClick={() => onChange("")}
        >
          <span>الكل</span>
        </button>
        {options.map((option) => (
          <button
            key={option.value}
            className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
            onClick={() => onChange(option.value)}
          >
            <span className="inline-flex items-center gap-2">
              <span className={cn("h-2.5 w-2.5 rounded-full", option.dot)} />
              {option.label}
            </span>
            {counts.has(option.value) && (
              <span className="text-xs bg-slate-100 dark:bg-slate-700 px-1.5 rounded-full font-mono text-slate-500">
                {counts.get(option.value)}
              </span>
            )}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

function KpiCard({ icon: Icon, label, value, accent }: { icon: any; label: string; value: number; accent: string }) {
  const displayValue = useCountUp(value);
  return (
    <div
      className="flex h-20 items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)]"
      style={{ borderInlineStart: `3px solid ${accent}` }}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--surface-raised)]">
        <Icon className="h-5 w-5" style={{ color: accent }} />
      </div>
      <div className="min-w-0">
        <span className="block text-[28px] font-bold leading-none text-[var(--text-primary)]">{displayValue.toLocaleString("ar-EG")}</span>
        <span className="mt-1 block truncate text-xs font-medium text-[var(--text-secondary)]">{label}</span>
      </div>
    </div>
  );
}

function useCountUp(value: number) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / 600, 1);
      setDisplay(Math.round(value * progress));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return display;
}

export default function EducationPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">جاري التحميل...</div>}>
      <EducationContent />
    </Suspense>
  );
}
