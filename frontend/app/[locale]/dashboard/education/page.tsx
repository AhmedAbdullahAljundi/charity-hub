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

  const levelCounts = new Map(Object.entries(kpis?.levelBreakdown ?? {}));
  const classificationCounts = new Map(Object.entries(kpis?.classificationBreakdown ?? {}));
  const emptyCounts = new Map<string, number>();

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900/50 pb-12 [--border-subtle:#F1F5F9] [--border:#E2E8F0] [--brand-dark:#16A34A] [--brand:#22C55E] [--page-bg:#F8FAFC] [--surface-raised:#F1F5F9] [--surface:#FFFFFF] [--text-muted:#94A3B8] [--text-primary:#0F172A] [--text-secondary:#475569] dark:[--border-subtle:#1E293B] dark:[--border:#334155] dark:[--brand-dark:#4ADE80] dark:[--brand:#22C55E] dark:[--page-bg:#0F172A] dark:[--surface-raised:#334155] dark:[--surface:#1E293B] dark:[--text-muted:#475569] dark:[--text-primary:#F1F5F9] dark:[--text-secondary:#94A3B8]">
      
      {/* 
        PREMIUM HEADER SECTION 
        Matching the medical module's aesthetic, but with education-themed colors.
      */}
      <div className="relative bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 pt-16 pb-24 overflow-hidden shadow-lg">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-indigo-100 text-sm font-medium backdrop-blur-md">
                <GraduationCap className="w-4 h-4" />
                <span>إدارة القطاع التعليمي</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                السجلات التعليمية
              </h1>
              <p className="text-indigo-100/80 text-lg max-w-xl leading-relaxed">
                متابعة المسار التعليمي للمستفيدين، تتبع التفوق والغياب، وإدارة حفظ القرآن الكريم والبرامج الأكاديمية المختلفة لضمان مستقبل أفضل.
              </p>
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="group relative inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-indigo-900 rounded-xl hover:bg-indigo-50 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] font-bold text-base overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Plus className="w-5 h-5 relative z-10 transition-transform group-hover:rotate-90" />
              <span className="relative z-10">إضافة سجل تعليمي</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-20 space-y-6 flex flex-col min-h-[500px]">
        {/* KPI CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <KpiCard icon={GraduationCap} label={t("kpi.total")} value={kpis?.totalStudents || 0} accent="#22C55E" />
          <KpiCard icon={Star} label={t("kpi.excellent")} value={kpis?.excellentCount || 0} accent="#10B981" />
          <KpiCard icon={TrendingUp} label={t("kpi.avgScore")} value={kpis?.avgTotalScore || 0} accent="#3B82F6" />
          <KpiCard icon={BookOpen} label={t("kpi.quranStudents")} value={kpis?.quranStudentsCount || 0} accent="#F59E0B" />
          <KpiCard icon={AlertCircle} label="عدد الراسبين" value={kpis?.failingCount || 0} accent="#F43F5E" />
          <KpiCard icon={AlertCircle} label={t("kpi.needsUpdate")} value={kpis?.needsUpdateCount || 0} accent="#64748B" />
        </div>

        {/* Filters and Search */}
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200/60 bg-white/95 backdrop-blur-sm px-4 py-3 shadow-lg shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900/95 dark:shadow-none">

        <FilterPopover
          name={t("filters.level")}
          selected={currentLevel}
          options={levelOptions.map(l => ({ value: l, label: t(`levels.${l}`), dot: "bg-blue-400" }))}
          counts={levelCounts}
          onChange={(value) => updateFilters("studentLevel", value)}
        />
        <FilterPopover
          name={t("filters.grade")}
          selected={currentGrade}
          options={gradeOptions.map(g => ({ value: g, label: t(`grades.${g}`), dot: "bg-green-400" }))}
          counts={emptyCounts}
          onChange={(value) => updateFilters("overallGrade", value)}
        />
        <FilterPopover
          name={t("filters.classification")}
          selected={currentClassification}
          options={classificationOptions.map((label) => ({ value: label, label: t(`classifications.${label}`), dot: "bg-slate-400" }))}
          counts={classificationCounts}
          onChange={(value) => updateFilters("classification", value)}
        />
        <FilterPopover
          name={t("filters.quranRange")}
          selected={currentQuranRange}
          options={quranRangeOptions.map(o => ({ ...o, dot: "bg-amber-400" }))}
          counts={emptyCounts}
          onChange={(value) => updateFilters("quranRange", value)}
        />

        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <Input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder={t("searchPlaceholder")}
            className="h-9 rounded-lg border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900 pr-9 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => setSearchValue("")}
              className="absolute left-2 top-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-9 rounded-lg border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <Download className="ms-1 h-4 w-4" />
              {t("export")}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => void exportExcel()}>Excel</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1 bg-white/95 dark:bg-slate-900/95 rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-lg shadow-slate-200/40 dark:shadow-none overflow-hidden flex flex-col">
        <EducationTable
          list={list}
          loading={loading}
          pagination={pagination}
          searchQuery={currentSearch}
        />
      </div>
    </div>
      
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
        <Button variant="outline" className="h-9 rounded-lg border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50">
          <span className="truncate max-w-[120px]">{selected ? options.find(o => o.value === selected)?.label || selected : name}</span>
          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl" align="end">
        <button
          className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          onClick={() => onChange("")}
        >
          <span>الكل</span>
        </button>
        {options.map((option) => (
          <button
            key={option.value}
            className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            onClick={() => onChange(option.value)}
          >
            <span className="inline-flex items-center gap-2">
              <span className={cn("h-2.5 w-2.5 rounded-full", option.dot)} />
              {option.label}
            </span>
            {counts.has(option.value) && (
              <span className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 rounded-full font-mono text-slate-500">
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
    <div className="flex items-start justify-between rounded-xl border border-slate-200/60 bg-white/80 backdrop-blur-xl px-5 py-4 shadow-lg shadow-slate-200/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-none">
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-3xl font-bold" style={{ color: accent }}>{displayValue.toLocaleString("ar-EG")}</p>
      </div>
      <div 
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-inner border" 
        style={{ 
          backgroundColor: `${accent}15`,
          color: accent,
          borderColor: `${accent}30`
        }}
      >
        <Icon className="h-6 w-6" />
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
