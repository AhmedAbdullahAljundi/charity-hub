"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronDown, Clock, Download, FileWarning, MapPin, Plus, Search, Settings2, Users, X } from "lucide-react";
import * as XLSX from "xlsx";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
 DropdownMenu,
 DropdownMenuCheckboxItem,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { HouseholdsTable, type HouseholdColumnKey } from "@/components/households/HouseholdsTable";
import { listHouseholds } from "@/lib/api/households-api";
import { useHouseholdStore } from "@/lib/stores/householdStore";
import { cn } from "@/lib/utils";

const COLUMN_STORAGE_KEY = "households_columns";

const allColumns: Array<{ key: HouseholdColumnKey; label: string }> = [
  { key: "select", label: "تحديد" },
  { key: "code", label: "رقم القيد" },
  { key: "family", label: "الأسرة" },
  { key: "address", label: "العنوان" },
  { key: "phone", label: "الهاتف" },
  { key: "dependents", label: "الأبناء" },
  { key: "income", label: "إجمالي الدخل" },
  { key: "score", label: "التقييم" },
  { key: "classification", label: "التصنيف" },
  { key: "actions", label: "أكشن" },
];

const eligibilityOptions = [
 { value: "CRITICAL", label: "حرج", dot: "bg-rose-600" },
 { value: "HIGH_NEED", label: "احتياج شديد", dot: "bg-orange-500" },
 { value: "MODERATE_NEED", label: "احتياج متوسط", dot: "bg-amber-500" },
 { value: "LOW_NEED", label: "احتياج منخفض", dot: "bg-blue-500" },
 { value: "NOT_ELIGIBLE", label: "غير مستحق", dot: "bg-slate-400" },
];

const classificationOptions = [
 "كفالة أيتام",
 "أيتام",
 "فقراء",
 "مساكين",
 "أسر سجناء",
 "ملف إعاقة",
 "ذوو إعاقة",
 "مسنون",
 "علاج شهري",
 "أمراض مزمنة",
 "حالات هجر",
 "طلاب علم",
 "طالب علم",
 "كبار سن",
 "مساعدات",
 "مساعدات موسمية",
 "لا يستحق المساعدة",
];

const decisionOptions = [
 { value: "PENDING", label: "بانتظار" },
 { value: "APPROVED", label: "موافق" },
 { value: "REJECTED", label: "مرفوض" },
 { value: "NEEDS_REVIEW", label: "يحتاج مراجعة" },
 { value: "ESCALATED", label: "تصعيد" },
];

function HouseholdsContent() {
 const t = useTranslations("households");
 const router = useRouter();
 const pathname = usePathname();
 const searchParams = useSearchParams();
 const { list, loading, pagination, fetchList } = useHouseholdStore();

 const currentSearch = searchParams.get("search") || "";
 const currentEligibility = searchParams.get("eligibility") || "";
 const currentClassification = searchParams.get("classification") || "";
 const currentDecision = searchParams.get("decisionStatus") || "";
 const currentPage = parseInt(searchParams.get("page") || "1", 10);
 const currentSort = searchParams.get("sort") || "";

 const [searchValue, setSearchValue] = useState(currentSearch);
 const [selectedIds, setSelectedIds] = useState<string[]>([]);
 const [visibleColumns, setVisibleColumns] = useState<HouseholdColumnKey[]>(() => {
 const defaults = allColumns.map((column) => column.key);
 if (typeof window === "undefined") return defaults;
 const stored = window.localStorage.getItem(COLUMN_STORAGE_KEY);
 if (!stored) return defaults;
 try {
 const parsed = JSON.parse(stored) as HouseholdColumnKey[];
 const allowed = allColumns.map((column) => column.key);
 const next = parsed.filter((key) => allowed.includes(key));
 return next.length ? next : defaults;
 } catch {
 return defaults;
 }
 });

 const updateFilters = (key: string, value: string) => {
 const params = new URLSearchParams(searchParams.toString());
 if (value) params.set(key, value);
 else params.delete(key);
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
 void fetchList({
 page: currentPage,
 limit: 12,
 search: currentSearch || undefined,
 eligibility: currentEligibility || undefined,
 classification: currentClassification || undefined,
 decisionStatus: currentDecision || undefined,
 sort: currentSort || undefined,
 });
 }, [fetchList, currentPage, currentSearch, currentEligibility, currentClassification, currentDecision, currentSort]);

  const stats = useMemo(() => {
  const total = pagination?.total || list.length;
  const evaluated = list.filter((household) => household.latestDecisionStatus && household.latestDecisionStatus !== "PENDING").length;
  const fieldVisits = list.filter((household) => household.latestDecisionStatus === "NEEDS_REVIEW").length;
  const missingFiles = list.filter((household) => !household.pdfUrl).length;
  return {
  total,
  evaluated,
  pending: Math.max(0, total - evaluated),
  fieldVisits,
  missingFiles,
  };
  }, [list, pagination?.total]);

 const optionCounts = useMemo(() => {
 const eligibility = new Map<string, number>();
 const classification = new Map<string, number>();
 const decision = new Map<string, number>();
 for (const household of list) {
 const score = household.latestScore || household.scoreResults?.[0];
 if (score?.systemRecommendation) eligibility.set(score.systemRecommendation, (eligibility.get(score.systemRecommendation) || 0) + 1);
 const tag = household.latestClassification || score?.classificationTag || score?.decisionNote || "لم يبت بعد";
 classification.set(tag, (classification.get(tag) || 0) + 1);
 const decisionStatus = household.latestDecisionStatus || score?.humanDecision || "PENDING";
 decision.set(decisionStatus, (decision.get(decisionStatus) || 0) + 1);
 }
 return { eligibility, classification, decision };
 }, [list]);

 const changeColumns = (key: HouseholdColumnKey, checked: boolean) => {
 const next = checked ? [...visibleColumns, key] : visibleColumns.filter((column) => column !== key);
 const normalized = allColumns.map((column) => column.key).filter((column) => next.includes(column));
 setVisibleColumns(normalized);
 window.localStorage.setItem(COLUMN_STORAGE_KEY, JSON.stringify(normalized));
 };

 const getExportData = async () => {
 const params = {
 page: 1,
 limit: 10000,
 search: currentSearch || undefined,
 eligibility: currentEligibility || undefined,
 classification: currentClassification || undefined,
 decisionStatus: currentDecision || undefined,
 sort: currentSort || undefined,
 };
 const result = await listHouseholds(params);
 return result.data;
 };

 const exportCsv = async () => {
 const data = await getExportData();
 const rows = data.map((household) => ({
 code: household.code,
 wife: household.spouseName || household.persons?.find((person) => person.gender === "FEMALE")?.name || "",
 husband: household.headName || household.persons?.find((person) => person.gender === "MALE")?.name || "",
 district: household.district,
 phone: household.primaryPhone || "",
 members: household.totalMembersCount ?? household.totalPersons ?? "",
 dependents: household.dependentCount ?? "",
 income: household.totalMonthlyIncome ?? "",
 score: household.latestScore?.normalizedPercent ?? household.scoreResults?.[0]?.normalizedPercent ?? "",
 classification: household.latestScore?.classificationTag || household.latestClassification || "",
 }));
 const csv = toCsv(rows);
 const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
 const url = URL.createObjectURL(blob);
 const link = document.createElement("a");
 link.href = url;
 link.download = `CharityHub-${new Date().toISOString().slice(0, 10)}.csv`;
 link.click();
 URL.revokeObjectURL(url);
 };

 const exportExcel = async () => {
 const data = await getExportData();
 const headers = [
 "رقم القيد", "اسم الزوجة", "اسم الزوج", "المحافظة", "العنوان", "الهاتف",
 "أطفال/معالون", "إجمالي الأسرة", "إجمالي الدخل", "نسبة التقييم",
 "مستوى الاستحقاق", "التصنيف", "حالة القرار"
 ];
 
 const rows = data.map((h) => [
 h.code,
 h.spouseName || h.persons?.find((p) => p.gender === "FEMALE")?.name || "",
 h.headName || h.persons?.find((p) => p.gender === "MALE")?.name || "",
 h.addressRegion || "",
 h.district || h.village || "",
 h.primaryPhone || "",
 h.dependentCount ?? "",
 h.totalMembersCount ?? h.totalPersons ?? "",
 h.totalMonthlyIncome ?? "",
 h.latestScore?.normalizedPercent ?? h.scoreResults?.[0]?.normalizedPercent ?? "",
 h.latestScore?.systemRecommendation || "",
 h.latestScore?.classificationTag || h.latestClassification || "",
 h.latestDecisionStatus || h.latestScore?.humanDecision || ""
 ]);

 const wb = XLSX.utils.book_new();
 const ws = XLSX.utils.aoa_to_sheet([
 ["CharityHub — قائمة الأسر المستهدفة"],
 [`تاريخ التصدير: ${new Date().toLocaleDateString("ar-EG")} | إجمالي الأسر: ${data.length}`],
 headers,
 ...rows
 ]);
 
 ws["!merges"] = [
 { s: { r: 0, c: 0 }, e: { r: 0, c: 12 } },
 { s: { r: 1, c: 0 }, e: { r: 1, c: 12 } }
 ];

 ws["!cols"] = [
 { wch: 15 }, { wch: 25 }, { wch: 25 }, { wch: 15 }, { wch: 20 }, { wch: 15 },
 { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 12 },
 { wch: 15 }, { wch: 15 }, { wch: 15 }
 ];

 wb.Workbook = { Views: [{ RTL: true }] };
 
 for (const key in ws) {
 if (key[0] === '!') continue;
 const cell = ws[key];
 const row = parseInt(key.replace(/[A-Z]/g, '')) - 1;
 
 if (row === 0) {
 cell.s = { font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "0F172A" } }, alignment: { horizontal: "center", vertical: "center" } };
 } else if (row === 1) {
 cell.s = { font: { sz: 10, color: { rgb: "64748B" } }, fill: { fgColor: { rgb: "F8FAFC" } }, alignment: { horizontal: "center" } };
 } else if (row === 2) {
 cell.s = { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "22C55E" } }, alignment: { horizontal: "center" } };
 } else {
 const isEven = (row - 3) % 2 === 0;
 cell.s = { fill: { fgColor: { rgb: isEven ? "FFFFFF" : "F8FAFC" } }, font: { sz: 11 } };
 }
 }
 
 ws["!rows"] = [{ hpx: 30 }, { hpx: 20 }, { hpx: 22 }];
 XLSX.utils.book_append_sheet(wb, ws, "Households");
 XLSX.writeFile(wb, `CharityHub-${new Date().toISOString().slice(0, 10)}.xlsx`);
 };

 return (
 <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900/50 pb-12 [--border-subtle:#F1F5F9] [--border:#E2E8F0] [--brand-dark:#16A34A] [--brand:#22C55E] [--page-bg:#F8FAFC] [--surface-raised:#F1F5F9] [--surface:#FFFFFF] [--text-muted:#94A3B8] [--text-primary:#0F172A] [--text-secondary:#475569] dark:[--border-subtle:#1E293B] dark:[--border:#334155] dark:[--brand-dark:#4ADE80] dark:[--brand:#22C55E] dark:[--page-bg:#0F172A] dark:[--surface-raised:#334155] dark:[--surface:#1E293B] dark:[--text-muted:#475569] dark:[--text-primary:#F1F5F9] dark:[--text-secondary:#94A3B8]">
 
  {/* PREMIUM HEADER SECTION */}
  <div className="relative bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 pt-16 pb-24 overflow-hidden shadow-lg">
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
    <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
    <div className="absolute top-1/2 -left-24 w-72 h-72 bg-slate-500/20 rounded-full blur-3xl pointer-events-none"></div>

    <div className="relative max-w-7xl mx-auto px-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-medium backdrop-blur-md">
            <Users className="w-4 h-4" />
            <span>إدارة الأسر المستهدفة</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            الأسر المستهدفة
          </h1>
          <p className="text-slate-300 text-lg max-w-xl leading-relaxed">
            متابعة شاملة لبيانات الأسر، التقييم الآلي، وتحديد الاستحقاق لضمان وصول الدعم لمستحقيه بكل دقة وشفافية.
          </p>
        </div>

        <Link
          href="/dashboard/households/new"
          className="group relative inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-emerald-950 rounded-xl hover:bg-emerald-50 transition-all duration-300 shadow-[0_0_40px_rgba(16,185,129,0.15)] hover:shadow-[0_0_60px_rgba(16,185,129,0.25)] font-bold text-base overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-slate-50 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Plus className="w-5 h-5 relative z-10 text-emerald-600 transition-transform group-hover:rotate-90" />
          <span className="relative z-10">{t("dashboard.actions.add")}</span>
        </Link>
      </div>
    </div>
  </div>

  <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-20 space-y-6 flex flex-col min-h-[500px]">
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      <KpiCard icon={Users} label={t("dashboard.metrics.total")} value={stats.total} accent="#22C55E" />
      <KpiCard icon={CheckCircle2} label={t("dashboard.metrics.evaluated")} value={stats.evaluated} accent="#10B981" />
      <KpiCard icon={Clock} label={t("dashboard.metrics.pending")} value={stats.pending} accent="#F59E0B" />
      <KpiCard icon={MapPin} label={t("dashboard.metrics.visit")} value={stats.fieldVisits} accent="#F97316" />
      <KpiCard icon={FileWarning} label={t("dashboard.metrics.incomplete")} value={stats.missingFiles} accent="#F43F5E" />
    </div>

    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200/60 bg-white/95 backdrop-blur-sm px-4 py-3 shadow-lg shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900/95 dark:shadow-none">
        <Button asChild className="h-9 shrink-0 rounded-lg bg-[var(--brand)] px-3 text-white hover:bg-[var(--brand-dark)]">
          <Link href="/dashboard/households/new">
            <Plus className="ms-1 h-4 w-4" />
            {t("dashboard.actions.add")}
          </Link>
        </Button>
        <FilterPopover
          name={t("dashboard.filters.class")}
          selected={currentEligibility}
          options={eligibilityOptions}
 counts={optionCounts.eligibility}
 onChange={(value) => updateFilters("eligibility", value)}
 />
 <FilterPopover
 name={t("dashboard.filters.classification")}
 selected={currentClassification}
 options={classificationOptions.map((label) => ({ value: label, label, dot: "bg-slate-400" }))}
 counts={optionCounts.classification}
 onChange={(value) => updateFilters("classification", value)}
 />
 <FilterPopover
 name={t("dashboard.filters.decision")}
 selected={currentDecision}
 options={decisionOptions.map((option) => ({ ...option, dot: "bg-slate-400" }))}
 counts={optionCounts.decision}
 onChange={(value) => updateFilters("decisionStatus", value)}
 />

        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <Input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder={t("dashboard.actions.searchPlaceholder")}
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
 <Settings2 className="ms-1 h-4 w-4" />
 {t("dashboard.actions.columns")}
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end" className="w-48">
 {allColumns.map((column) => (
 <DropdownMenuCheckboxItem
 key={column.key}
 checked={visibleColumns.includes(column.key)}
 onCheckedChange={(checked) => changeColumns(column.key, Boolean(checked))}
 >
 {column.key === "select" ? "" : t(`table.headers.${column.key}`)}
 </DropdownMenuCheckboxItem>
 ))}
 </DropdownMenuContent>
 </DropdownMenu>

 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button variant="outline" className="h-9 rounded-lg border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50">
 <Download className="ms-1 h-4 w-4" />
 {t("dashboard.actions.export")}
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end">
 <DropdownMenuItem onClick={() => void exportCsv()}>CSV</DropdownMenuItem>
 <DropdownMenuItem onClick={() => void exportExcel()}>Excel</DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 </div>

 <div className="flex-1 bg-white/95 dark:bg-slate-900/95 rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-lg shadow-slate-200/40 dark:shadow-none overflow-hidden flex flex-col">
   <HouseholdsTable
   list={list}
   loading={loading}
   pagination={pagination}
   searchQuery={currentSearch}
   visibleColumns={visibleColumns}
   selectedIds={selectedIds}
   onSelectedIdsChange={setSelectedIds}
   />
 </div>
 </div>
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
          <span className="text-xs text-slate-400">{Array.from(counts.values()).reduce((a, b) => a + b, 0)}</span>
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
            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs text-slate-500">
              {counts.get(option.value) || 0}
            </span>
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

function toCsv(rows: Array<Record<string, unknown>>) {
 if (!rows.length) return "";
 const headers = Object.keys(rows[0]);
 const escapeCell = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
 return [headers.join(","), ...rows.map((row) => headers.map((header) => escapeCell(row[header])).join(","))].join("\n");
}

export default function HouseholdsPage() {
 return (
 <Suspense fallback={<div className="p-8 text-center text-muted-foreground">جاري التحميل...</div>}>
 <HouseholdsContent />
 </Suspense>
 );
}
