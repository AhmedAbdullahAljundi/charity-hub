"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronDown, Clock, Download, FileWarning, MapPin, Plus, Search, Settings2, Users, X } from "lucide-react";
import * as XLSX from "xlsx";
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
  { key: "dependents", label: "أطفال/معالون" },
  { key: "total", label: "إجمالي الأسرة" },
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
  "أيتام",
  "فقراء",
  "مساكين",
  "أسر سجناء",
  "ذوو إعاقة",
  "مسنون",
  "أمراض مزمنة",
  "حالات هجر",
  "طالب علم",
  "كبار سن",
  "لا يستحق",
];

const decisionOptions = [
  { value: "PENDING", label: "بانتظار" },
  { value: "APPROVED", label: "موافق" },
  { value: "REJECTED", label: "مرفوض" },
  { value: "NEEDS_REVIEW", label: "يحتاج مراجعة" },
  { value: "ESCALATED", label: "تصعيد" },
];

function HouseholdsContent() {
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
    const evaluated = list.filter((household) => household.latestScore || household.scoreResults?.[0]).length;
    const fieldVisits = list.filter((household) => household.latestScore?.humanDecision === "NEEDS_REVIEW").length;
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
    <div
      dir="rtl"
      className="grid h-[calc(100vh-6rem)] min-h-0 grid-rows-[auto_auto_1fr_auto] gap-3 overflow-hidden bg-[var(--page-bg)] text-[var(--text-primary)] [--border-subtle:#F1F5F9] [--border:#E2E8F0] [--brand-dark:#16A34A] [--brand:#22C55E] [--page-bg:#F8FAFC] [--surface-raised:#F1F5F9] [--surface:#FFFFFF] [--text-muted:#94A3B8] [--text-primary:#0F172A] [--text-secondary:#475569] dark:[--border-subtle:#1E293B] dark:[--border:#334155] dark:[--brand-dark:#4ADE80] dark:[--brand:#22C55E] dark:[--page-bg:#0F172A] dark:[--surface-raised:#334155] dark:[--surface:#1E293B] dark:[--text-muted:#475569] dark:[--text-primary:#F1F5F9] dark:[--text-secondary:#94A3B8] lg:h-[calc(100vh-7rem)]"
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <KpiCard icon={Users} label="إجمالي الأسر" value={stats.total} accent="#22C55E" />
        <KpiCard icon={CheckCircle2} label="تم تقييمها" value={stats.evaluated} accent="#10B981" />
        <KpiCard icon={Clock} label="بانتظار تقييم" value={stats.pending} accent="#F59E0B" />
        <KpiCard icon={MapPin} label="زيارة ميدانية" value={stats.fieldVisits} accent="#F97316" />
        <KpiCard icon={FileWarning} label="ملفات ناقصة" value={stats.missingFiles} accent="#F43F5E" />
      </div>

      <div className="flex min-h-12 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
        <Button asChild className="h-9 shrink-0 rounded-lg bg-[var(--brand)] px-3 text-white hover:bg-[var(--brand-dark)]">
          <Link href="/dashboard/households/new">
            <Plus className="ms-1 h-4 w-4" />
            إضافة أسرة
          </Link>
        </Button>

        <FilterPopover
          name="الطبقة"
          selected={currentEligibility}
          options={eligibilityOptions}
          counts={optionCounts.eligibility}
          onChange={(value) => updateFilters("eligibility", value)}
        />
        <FilterPopover
          name="التصنيف"
          selected={currentClassification}
          options={classificationOptions.map((label) => ({ value: label, label, dot: "bg-slate-400" }))}
          counts={optionCounts.classification}
          onChange={(value) => updateFilters("classification", value)}
        />
        <FilterPopover
          name="القرار"
          selected={currentDecision}
          options={decisionOptions.map((option) => ({ ...option, dot: "bg-slate-400" }))}
          counts={optionCounts.decision}
          onChange={(value) => updateFilters("decisionStatus", value)}
        />

        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <Input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="ابحث بالاسم، الرقم القومي، الهاتف، أو رقم القيد..."
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
              <Settings2 className="ms-1 h-4 w-4" />
              أعمدة
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {allColumns.map((column) => (
              <DropdownMenuCheckboxItem
                key={column.key}
                checked={visibleColumns.includes(column.key)}
                onCheckedChange={(checked) => changeColumns(column.key, Boolean(checked))}
              >
                {column.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-9 rounded-lg border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)]">
              <Download className="ms-1 h-4 w-4" />
              تصدير
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => void exportCsv()}>CSV</DropdownMenuItem>
            <DropdownMenuItem onClick={() => void exportExcel()}>Excel</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

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
          <span className="text-xs text-slate-400">{Array.from(counts.values()).reduce((a, b) => a + b, 0)}</span>
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
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-800">
              {counts.get(option.value) || 0}
            </span>
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

function KpiCard({ icon: Icon, label, value, accent }: { icon: typeof Users; label: string; value: number; accent: string }) {
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
