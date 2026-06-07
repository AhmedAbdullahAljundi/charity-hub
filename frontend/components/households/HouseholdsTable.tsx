"use client";

import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Edit, Eye, FileText, MessageCircle, MoreVertical, Paperclip, Trash2 } from "lucide-react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuthStore } from "@/lib/stores/authStore";
import { useHouseholdStore } from "@/lib/stores/householdStore";
import { cn } from "@/lib/utils";
import type { HouseholdDto, IncomeSourceDto, LayerBreakdownItem, PersonDto } from "@/lib/types/api";

export type HouseholdColumnKey =
  | "select"
  | "code"
  | "family"
  | "address"
  | "phone"
  | "dependents"
  | "total"
  | "income"
  | "score"
  | "classification"
  | "actions";

type SortDirection = "asc" | "desc";
type SortItem = { column: string; direction: SortDirection };

interface HouseholdsTableProps {
  list: HouseholdDto[];
  loading: boolean;
  pagination: { page: number; pages: number; total: number; limit: number } | null;
  searchQuery?: string;
  visibleColumns: HouseholdColumnKey[];
  selectedIds: string[];
  onSelectedIdsChange: (ids: string[]) => void;
}

const columnWidths: Record<HouseholdColumnKey, string> = {
  select: "3%",
  code: "6%",
  family: "24%",
  address: "16%",
  phone: "10%",
  dependents: "6%",
  total: "0%", // We merge this into dependents
  income: "12%",
  score: "9%",
  classification: "10%",
  actions: "4%",
};

const eligibilityLabels: Record<string, string> = {
  CRITICAL: "احتياج شديد",
  HIGH_NEED: "احتياج عال",
  MODERATE_NEED: "احتياج متوسط",
  LOW_NEED: "احتياج منخفض",
  NOT_ELIGIBLE: "غير مستحق",
};

const eligibilityPills: Record<string, string> = {
  CRITICAL: "bg-[#FFF1F2] text-[#BE123C] dark:bg-[#4C0519]",
  HIGH_NEED: "bg-[#FFF7ED] text-[#C2410C] dark:bg-[#431407]",
  MODERATE_NEED: "bg-[#FFFBEB] text-[#B45309] dark:bg-[#451A03]",
  LOW_NEED: "bg-[#EFF6FF] text-[#1D4ED8] dark:bg-[#1E3A5F]",
  NOT_ELIGIBLE: "bg-[#F8FAFC] text-[#475569] dark:bg-[#1E293B]",
};

const eligibilityBars: Record<string, string> = {
  CRITICAL: "bg-rose-600",
  HIGH_NEED: "bg-orange-500",
  MODERATE_NEED: "bg-amber-500",
  LOW_NEED: "bg-blue-500",
  NOT_ELIGIBLE: "bg-slate-400",
};

const eligibilityText: Record<string, string> = {
  CRITICAL: "text-rose-600 dark:text-rose-400",
  HIGH_NEED: "text-orange-500",
  MODERATE_NEED: "text-amber-500",
  LOW_NEED: "text-blue-500",
  NOT_ELIGIBLE: "text-slate-400 dark:text-slate-500",
};

const classificationPills: Record<string, string> = {
  "كفالة أيتام": "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300",
  "أيتام": "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300",
  "فقراء": "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300",
  "مساكين": "bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300",
  "أسر سجناء": "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  "ملف إعاقة": "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
  "ذوو إعاقة": "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
  "مسنون": "bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300",
  "علاج شهري": "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/60 dark:text-yellow-300",
  "أمراض مزمنة": "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/60 dark:text-yellow-300",
  "حالات هجر": "bg-pink-50 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300",
  "طلاب علم": "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
  "طالب علم": "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
  "كبار سن": "bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300",
  "مساعدات": "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  "مساعدات موسمية": "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
  "لا يستحق المساعدة": "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
};

export function HouseholdsTable({
  list,
  loading,
  pagination,
  searchQuery = "",
  visibleColumns,
  selectedIds,
  onSelectedIdsChange,
}: HouseholdsTableProps) {
  const t = useTranslations("households");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const remove = useHouseholdStore((state) => state.remove);
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "ADMIN";
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const sorts = parseSort(searchParams.get("sort"));

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [pagination?.page, loading]);

  const sortedList = useMemo(() => sortRows(list, sorts), [list, sorts]);
  const currentPage = pagination?.page || 1;
  const totalPages = pagination?.pages || 1;
  const total = pagination?.total || sortedList.length;
  const limit = pagination?.limit || 12;
  const from = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const to = Math.min(currentPage * limit, total);
  const colSpan = visibleColumns.length;

  const show = (key: HouseholdColumnKey) => visibleColumns.includes(key);

  const updatePage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`${pathname}?${params.toString()}`);
  };

  const toggleSort = (column: string, event?: React.MouseEvent) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = parseSort(params.get("sort"));
    const existingIndex = current.findIndex((item) => item.column === column);
    const existing = existingIndex >= 0 ? current[existingIndex] : null;
    let next = event?.shiftKey ? current.slice(0, 2) : [];

    if (!existing) {
      next = event?.shiftKey ? [...next, { column, direction: "asc" as const }].slice(0, 2) : [{ column, direction: "asc" }];
    } else if (existing.direction === "asc") {
      if (event?.shiftKey) next[existingIndex] = { column, direction: "desc" };
      else next = [{ column, direction: "desc" }];
    } else {
      next = event?.shiftKey ? next.filter((item) => item.column !== column) : [];
    }

    if (next.length) params.set("sort", next.map((item) => `${item.column}:${item.direction}`).join(","));
    else params.delete("sort");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const toggleSelected = (id: string) => {
    onSelectedIdsChange(selectedIds.includes(id) ? selectedIds.filter((item) => item !== id) : [...selectedIds, id]);
  };

  const toggleAll = () => {
    const ids = sortedList.map((household) => household.id);
    const allSelected = ids.every((id) => selectedIds.includes(id));
    onSelectedIdsChange(allSelected ? selectedIds.filter((id) => !ids.includes(id)) : Array.from(new Set([...selectedIds, ...ids])));
  };

  const toggleExpanded = (id: string) => {
    setExpandedRows((rows) => (rows.includes(id) ? rows.filter((row) => row !== id) : [...rows, id]));
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await remove(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="relative grid min-h-0 grid-rows-[auto_1fr_48px] overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900">
      <table className="w-full table-fixed border-collapse">
        <ColumnGroup visibleColumns={visibleColumns} />
        <thead className="bg-primary/5 dark:bg-primary/10 text-[13px] font-semibold uppercase tracking-[0.05em] text-primary/80 dark:text-primary/70">
          <tr className="border-b-2 border-primary/10 dark:border-primary/20">
            {show("select") && (
              <th className="px-2 py-3">
                <Checkbox checked={sortedList.length > 0 && sortedList.every((row) => selectedIds.includes(row.id))} onCheckedChange={toggleAll} />
              </th>
            )}
            {show("code") && <SortableTh label={t("table.headers.code")} column="code" sorts={sorts} onSort={toggleSort} />}
            {show("family") && (
              <th className="px-3 py-3 text-start">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="inline-flex items-center gap-1">
                      {t("table.headers.family")}
                      <ChevronDown className="h-3.5 w-3.5" />
                      <SortIndicator column="wifeName" sorts={sorts} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => toggleSort("wifeName")}>{t("table.sort.wife")}</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleSort("husbandName")}>{t("table.sort.husband")}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </th>
            )}
            {show("address") && <SortableTh label={t("table.headers.address")} column="address" sorts={sorts} onSort={toggleSort} />}
            {show("phone") && <th className="px-3 py-3 text-center">{t("table.headers.phone")}</th>}
            {show("dependents") && (
              <SortableTh label="الأبناء" column="dependentCount" sorts={sorts} onSort={toggleSort} center />
            )}
            {show("income") && <SortableTh label={t("table.headers.income")} column="totalIncome" sorts={sorts} onSort={toggleSort} center />}
            {show("score") && <SortableTh label={t("table.headers.score")} column="score" sorts={sorts} onSort={toggleSort} center />}
            {show("classification") && <SortableTh label={t("table.headers.classification")} column="classification" sorts={sorts} onSort={toggleSort} center />}
            {show("actions") && <th className="px-2 py-3" aria-label={t("table.headers.actions")} />}
          </tr>
        </thead>
      </table>

      <div ref={bodyRef} className="min-h-0 overflow-y-auto overflow-x-hidden" style={{ maxHeight: "calc(100vh - 280px)" }}>
        <table className="w-full table-fixed border-collapse text-sm">
          <ColumnGroup visibleColumns={visibleColumns} />
          <tbody>
            {loading &&
              Array.from({ length: 10 }).map((_, index) => <SkeletonRow key={index} visibleColumns={visibleColumns} />)}

            {!loading &&
              sortedList.map((household) => (
                <Fragment key={household.id}>
                  <HouseholdRow
                    household={household}
                    searchQuery={searchQuery}
                    isAdmin={isAdmin}
                    deleting={deletingId === household.id}
                    expanded={expandedRows.includes(household.id)}
                    selected={selectedIds.includes(household.id)}
                    visibleColumns={visibleColumns}
                    onDelete={handleDelete}
                    onExpand={toggleExpanded}
                    onSelect={toggleSelected}
                  />
                  <tr>
                    <td colSpan={colSpan} className="p-0">
                      <ExpandedPanel household={household} open={expandedRows.includes(household.id)} />
                    </td>
                  </tr>
                </Fragment>
              ))}

            {!loading && sortedList.length === 0 && (
              <tr>
                <td colSpan={colSpan} className="h-72 text-center">
                  <div className="mx-auto flex max-w-sm flex-col items-center gap-3 text-slate-500 dark:text-slate-400">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500">
                      <FileText className="h-7 w-7" />
                    </div>
                    <p className="text-base font-semibold text-slate-900 dark:text-slate-100">{t("table.empty.title")}</p>
                    <Button variant="outline" onClick={() => router.replace(pathname)}>
                      {t("table.empty.clear")}
                    </Button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedIds.length > 0 && (
        <div className="absolute bottom-12 left-4 right-4 z-20 flex h-11 items-center justify-between rounded-xl bg-green-600 px-4 text-sm shadow-lg">
          <span className="font-medium text-white">{selectedIds.length.toLocaleString("ar-EG")}  {t("table.selection.selected")}</span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="border-green-500 bg-green-700 text-white hover:bg-green-800 hover:text-white">{t("table.selection.calculateAll")}</Button>
            <Button size="sm" variant="outline" className="border-green-500 bg-green-700 text-white hover:bg-green-800 hover:text-white">{t("table.selection.export")}</Button>
            <Button size="sm" variant="ghost" className="text-green-50 hover:bg-green-700 hover:text-white" onClick={() => onSelectedIdsChange([])}>{t("table.selection.cancel")}</Button>
          </div>
        </div>
      )}

      <div className="flex h-12 items-center justify-between border-t border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900 px-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t("table.pagination.showing")} {from.toLocaleString("ar-EG")}{t("table.pagination.to")}{to.toLocaleString("ar-EG")} {t("table.pagination.of")} {total.toLocaleString("ar-EG")} {t("table.pagination.items")}
        </p>
        <div className="flex items-center gap-1">
          <PageButton disabled={currentPage <= 1} onClick={() => updatePage(currentPage - 1)}>
            <ChevronRight className="h-4 w-4" />
            {t("table.pagination.prev")}
          </PageButton>
          {paginationWindow(currentPage, totalPages).map((page, index) =>
            page === "ellipsis" ? (
              <span key={`ellipsis-${index}`} className="px-2 text-[var(--text-muted)]">...</span>
            ) : (
              <button
                key={page}
                onClick={() => updatePage(page)}
                className={cn(
                  "h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-700/50 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50",
                  page === currentPage && "border-green-600 bg-green-600 text-white hover:bg-green-600"
                )}
              >
                {page.toLocaleString("ar-EG")}
              </button>
            )
          )}
          <PageButton disabled={currentPage >= totalPages} onClick={() => updatePage(currentPage + 1)}>
            {t("table.pagination.next")}
            <ChevronLeft className="h-4 w-4" />
          </PageButton>
        </div>
      </div>
    </div>
  );
}

function ColumnGroup({ visibleColumns }: { visibleColumns: HouseholdColumnKey[] }) {
  return (
    <colgroup>
      {visibleColumns.map((column) => (
        <col key={column} style={{ width: columnWidths[column] }} />
      ))}
    </colgroup>
  );
}

function HouseholdRow({
  household,
  searchQuery,
  isAdmin,
  deleting,
  expanded,
  selected,
  visibleColumns,
  onDelete,
  onExpand,
  onSelect,
}: {
  household: HouseholdDto;
  searchQuery: string;
  isAdmin: boolean;
  deleting: boolean;
  expanded: boolean;
  selected: boolean;
  visibleColumns: HouseholdColumnKey[];
  onDelete: (id: string) => Promise<void>;
  onExpand: (id: string) => void;
  onSelect: (id: string) => void;
}) {
  const t = useTranslations("households");
  const show = (key: HouseholdColumnKey) => visibleColumns.includes(key);
  // Prioritize isHead, then female spouse (often the primary applicant in charities), then HEAD role, then fallback
  const head = household.persons?.find((p) => p.isHead) || 
               household.persons?.find((p) => p.gender === "FEMALE" && (p.role === "SPOUSE" || p.role === "HEAD")) || 
               household.persons?.find((p) => p.role === "HEAD") || 
               household.persons?.[0];
  const headGender = head?.gender === "FEMALE" ? "FEMALE" : "MALE";
  const score = household.latestScore || household.scoreResults?.[0];
  const recommendation = score?.systemRecommendation;
  const percent = score ? Math.round(Number(score.normalizedPercent || 0)) : null;
  const income = Math.abs(Number(household.totalMonthlyIncome || 0));
  let classification = score?.classificationTag || extractClassification(household.latestClassification || score?.decisionNote);
  const legacyMap: Record<string, string> = { "1": "أيتام", "2": "إعاقة", "3": "طالب علم", "4": "أسر سجناء", "5": "مساعدات", "6": "دعم خارجي", "7": "منفردون", "9": "مطلقات", "10": "مساكين" };
  if (classification && legacyMap[classification]) {
    classification = legacyMap[classification];
  }
  const familyName = (household as any).familyName || household.headName || household.spouseName || household.code;

  return (
    <tr className={cn("group h-[56px] border-b border-slate-100 dark:border-slate-800 text-sm transition-[background-color] duration-150 hover:bg-slate-50 dark:hover:bg-slate-800/50", selected && "bg-green-50/60 dark:bg-green-950/20")}>
      {show("select") && (
        <td className="px-2 text-center">
          <div className="opacity-0 transition-opacity group-hover:opacity-100 data-[selected=true]:opacity-100" data-selected={selected}>
            <Checkbox checked={selected} onCheckedChange={() => onSelect(household.id)} className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600" />
          </div>
        </td>
      )}
      {show("code") && (
        <td className="px-2 align-middle">
          <div className="flex items-center gap-1">
            <button onClick={() => onExpand(household.id)} className="rounded p-0.5 text-slate-400 dark:text-slate-500 hover:bg-white dark:hover:bg-slate-900 hover:text-green-600">
              <ChevronLeft className={cn("h-3.5 w-3.5 transition-transform", expanded && "-rotate-90")} />
            </button>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">{shortCode(household.code)}</span>
              </TooltipTrigger>
              <TooltipContent>{household.code}</TooltipContent>
            </Tooltip>
          </div>
        </td>
      )}
      {show("family") && (
        <td className="px-3 py-2 align-middle">
          <div className="flex items-start gap-2">
            <span className={cn("mt-0.5 inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[10px] font-bold", headGender === "FEMALE" ? "bg-pink-100 text-pink-700 dark:bg-pink-900/60 dark:text-pink-300" : "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300")}>
              {head ? getAge(head) ?? "-" : "-"}
            </span>
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-sm font-bold text-slate-900 dark:text-slate-100" title={familyName || "-"}>
                  {highlightText(familyName || "-", searchQuery)}
                </span>
                <PdfLink url={household.pdfUrl} />
              </div>
              <TagList household={household} />
            </div>
          </div>
        </td>
      )}
      {show("address") && (
        <td className="px-3 align-middle">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="rounded border border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/50 px-1.5 py-0.5 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                {household.addressRegion || "--"}
              </span>
              <span className="truncate text-sm text-slate-600 dark:text-slate-300" title={household.district || household.village || "-"}>{household.district || household.village || "-"}</span>
            </div>
            <p className="line-clamp-2 text-xs text-slate-400 dark:text-slate-500">
              {[household.addressStreet, household.addressDetails || household.address].filter(Boolean).join(" - ") || "-"}
            </p>
          </div>
        </td>
      )}
      {show("phone") && (
        <td className="px-2 text-center align-middle">
          <div className="flex items-center justify-center gap-1.5">
            {household.primaryPhone ? (
              <>
                <span dir="ltr" className="text-xs font-medium text-slate-900 dark:text-slate-100">{household.primaryPhone}</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a href={`https://wa.me/2${cleanEgyptPhone(household.whatsappPhone || household.primaryPhone)}`}
                      target="_blank" rel="noreferrer" className="rounded-full p-1 text-[#25D366] hover:bg-emerald-50 dark:hover:bg-emerald-900/30">
                      <MessageCircle className="h-4 w-4" />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>{t("table.tooltips.whatsapp")}</TooltipContent>
                </Tooltip>
              </>
            ) : (
              <span className="text-slate-400 dark:text-slate-500">—</span>
            )}
          </div>
        </td>
      )}
      {show("dependents") && (
        <td className="px-1 text-center align-middle">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center justify-center gap-1 mx-auto w-fit">
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{household.dependentCount ?? 0}</span>
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold px-1.5 py-0.5 rounded-md" title="إجمالي أفراد الأسرة">
                  {household.totalMembersCount ?? household.totalPersons ?? 0}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>الأبناء المعالين / إجمالي الأفراد</TooltipContent>
          </Tooltip>
        </td>
      )}
      {show("income") && (
        <td className="px-3 text-center align-middle">
          <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-medium", recommendation ? eligibilityPills[recommendation] : "bg-slate-100 text-slate-500 dark:bg-slate-800")}>
            {income.toLocaleString("ar-EG")} ج
          </span>
        </td>
      )}
      {show("score") && (
        <td className="px-3 text-center align-middle">
          {score && percent != null ? (
            <div className="space-y-1 w-full max-w-[100px] mx-auto">
              <div className="h-1.5 w-full overflow-hidden rounded bg-slate-100 dark:bg-slate-800">
                <div className={cn("h-full rounded", recommendation ? eligibilityBars[recommendation] : "bg-slate-300")} style={{ width: `${Math.min(Math.max(percent, 0), 100)}%` }} />
              </div>
              <div className="flex items-center justify-between gap-1 text-[10px] font-bold">
                <span 
                  className={cn("truncate", recommendation ? eligibilityText[recommendation] : "text-slate-500")}
                  title={recommendation ? eligibilityLabels[recommendation] : ""}
                >
                  {recommendation ? eligibilityLabels[recommendation] : ""}
                </span>
                <span className="text-slate-900 dark:text-slate-100">{percent}%</span>
              </div>
            </div>
          ) : <span className="text-slate-400 dark:text-slate-500">—</span>}
        </td>
      )}
      {show("classification") && (
        <td className="px-3 text-center align-middle">
          {classification ? (
            <span className={cn("inline-flex justify-center rounded-full px-3 py-1 text-xs font-medium min-w-[70px]", classificationPills[classification] || "bg-slate-100 text-slate-500 dark:bg-slate-800")}>{classification}</span>
          ) : (
            <span className="inline-flex justify-center rounded-full border border-dashed border-slate-200 dark:border-slate-700/50 px-3 py-1 text-xs text-slate-400 dark:text-slate-500 min-w-[70px]">{t("table.status.pending")}</span>
          )}
        </td>
      )}
      {show("actions") && (
        <td className="px-2 text-center align-middle">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-100">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/households/${household.id}/view`} className="flex items-center gap-2 cursor-pointer">
                  <Eye className="h-4 w-4 text-green-500" /> عرض
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/households/${household.id}/wizard`} className="flex items-center gap-2 cursor-pointer">
                  <Edit className="h-4 w-4 text-emerald-500" /> تعديل
                </Link>
              </DropdownMenuItem>
              {isAdmin && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="flex items-center gap-2 cursor-pointer text-rose-500 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-900/30">
                      <Trash2 className="h-4 w-4" /> حذف
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t("table.deleteDialog.title")}</AlertDialogTitle>
                      <AlertDialogDescription>{t("table.deleteDialog.desc")} {familyName}؟ {t("table.deleteDialog.warning")}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t("table.deleteDialog.cancel")}</AlertDialogCancel>
                      <AlertDialogAction disabled={deleting} onClick={() => onDelete(household.id)} className="bg-rose-600 text-white hover:bg-rose-700">{t("table.deleteDialog.confirm")}</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </td>
      )}
    </tr>
  );
}

function ExpandedPanel({ household, open }: { household: HouseholdDto; open: boolean }) {
  const t = useTranslations("households");
  const tFam = useTranslations("families") as any;
  const score = household.latestScore || household.scoreResults?.[0];
  const layers = normalizeLayers(score?.layerBreakdown);
  
  const pCount = household.persons?.length || 0;
  const isCompactPersons = pCount > 3;

  const iCount = household.incomeSources?.length || 0;
  const isCompactIncome = iCount > 2;

  // Helper for safe translation
  const getIncomeLabel = (channel: string) => {
    if (!channel) return channel;
    
    const key1 = `wizard.income.channels.${channel}`;
    if (t.has(key1)) return t(key1);
    
    const key2 = `wizard.income.channels.${channel.toUpperCase()}`;
    if (t.has(key2)) return t(key2);

    const key3 = `dictionaries.incomeSources.${channel}`;
    if (tFam.has(key3)) return tFam(key3);

    const key4 = `dictionaries.incomeSources.${channel.toLowerCase()}`;
    if (tFam.has(key4)) return tFam(key4);

    return channel;
  };

  const getLayerLabel = (id: string) => {
    if (!id) return id;
    const cleanId = id.replace('layer_', '');
    const key = `wizard.evaluation.layers.${cleanId}`;
    if (t.has(key)) return t(key);
    
    const LAYER_KEYS = ['L1_HEAD', 'L2_DEPENDENTS', 'L3_STUDENTS', 'L4_VULNERABILITY', 'L5_BURDENS', 'L5B_HOUSING', 'L6_HEALTH', 'L7_CORRECTIONS', 'L8_INCOME', 'FE_FRAUD'];
    
    for (const k of LAYER_KEYS) {
      const prefix = k.split('_')[0];
      if (cleanId.toUpperCase() === prefix.toUpperCase()) {
        return t(`wizard.evaluation.layers.${k}`);
      }
    }
    
    const LAYER_FALLBACK_PATTERNS: [RegExp, string][] = [
      [/head/i, 'L1_HEAD'],
      [/depend/i, 'L2_DEPENDENTS'],
      [/student/i, 'L3_STUDENTS'],
      [/vuln/i, 'L4_VULNERABILITY'],
      [/burden/i, 'L5_BURDENS'],
      [/hous/i, 'L5B_HOUSING'],
      [/health|disease|disab/i, 'L6_HEALTH'],
      [/correct/i, 'L7_CORRECTIONS'],
      [/income/i, 'L8_INCOME'],
      [/fraud|fe/i, 'FE_FRAUD'],
    ];
    for (const [pattern, fbKey] of LAYER_FALLBACK_PATTERNS) {
      if (pattern.test(cleanId)) return t(`wizard.evaluation.layers.${fbKey}`);
    }
    return id;
  };

  return (
    <div className={cn("grid overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out", open ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0")}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-primary/10 dark:border-primary/20 bg-gradient-to-l from-primary/5 to-white dark:from-primary/10 dark:to-slate-900 px-6 py-5 shadow-inner">
        
        {/* RIGHT: Individuals */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{t("table.expanded.members") || "الأفراد"}</h4>
            <span className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] px-2 py-0.5 rounded-full font-bold">{pCount}</span>
          </div>
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
            {(household.persons || []).map((person) => {
               const pTags = [];
               if (person.isStudent) pTags.push({ label: "طالب", className: "bg-sky-50 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300" });
               if ((person.diseases?.length || 0) > 0) pTags.push({ label: "مرض مزمن", className: "bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" });
               if ((person.disabilities?.length || 0) > 0) pTags.push({ label: "إعاقة", className: "bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" });
               
               return (
                 <div key={person.id} className="flex items-center gap-2 bg-white dark:bg-slate-800/80 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm p-1.5 shrink-0 overflow-hidden">
                   <span className="font-semibold text-slate-900 dark:text-slate-100 truncate text-[11px] max-w-[110px]" title={person.name}>{person.name}</span>
                   
                   <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar no-scrollbar shrink-0 mr-auto">
                     <span className="bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 text-[9px] px-1.5 py-0.5 rounded-md font-medium whitespace-nowrap">{roleLabel(person.role)}</span>
                     <span className="bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 text-[9px] px-1.5 py-0.5 rounded-md font-medium whitespace-nowrap">{getAge(person) ?? "-"} سنة</span>
                     {pTags.map(tag => <span key={tag.label} className={cn("font-bold rounded-md whitespace-nowrap text-[9px] px-1.5 py-0.5", tag.className)}>{tag.label}</span>)}
                   </div>
                 </div>
               );
            })}
          </div>
        </div>

        {/* CENTER: Phones & Income */}
        <div className="space-y-4 border-t md:border-t-0 md:border-r border-slate-200 dark:border-slate-700 pt-4 md:pt-0 md:pr-6 flex flex-col">
          
          {/* Confidence Progress */}
          <div className="space-y-1.5 bg-white dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm shrink-0">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">مؤشر الثقة (Confidence)</span>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400" dir="ltr">{Math.round(Number(score?.confidenceScore || 0) * 100)}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
               <div 
                 className={cn("h-full rounded-full transition-all duration-1000", (Number(score?.confidenceScore || 0) * 100) >= 70 ? "bg-emerald-500" : (Number(score?.confidenceScore || 0) * 100) >= 40 ? "bg-amber-500" : "bg-rose-500")}
                 style={{ width: `${Math.round(Number(score?.confidenceScore || 0) * 100)}%` }} 
               />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 flex-1 min-h-0">
            {/* Phones Half */}
            <div className="space-y-2 flex flex-col">
              <h5 className="text-[11px] font-bold text-slate-500 dark:text-slate-400">التواصل</h5>
              <div className="flex flex-col gap-1.5 overflow-y-auto pr-1 custom-scrollbar max-h-[140px]">
                {/* Primary Phone */}
                <div className="flex items-center gap-1.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1.5 rounded-lg border border-green-100 dark:border-green-800/50 text-[10px] font-semibold shrink-0">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                  <span>أساسي:</span>
                  <span dir="ltr" className="mr-auto">{household.primaryPhone || "—"}</span>
                </div>
                
                {/* WhatsApp Phone */}
                {household.whatsappPhone && household.whatsappPhone !== household.primaryPhone && (
                  <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-800/50 text-[10px] font-semibold shrink-0">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                    <span>واتس:</span>
                    <span dir="ltr" className="mr-auto">{household.whatsappPhone}</span>
                  </div>
                )}

                {/* Secondary Phone */}
                {household.secondaryPhone && (
                  <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-medium shrink-0">
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                    <span>إضافي 1:</span>
                    <span dir="ltr" className="mr-auto">{household.secondaryPhone}</span>
                  </div>
                )}
                
                {/* Backup Phone */}
                {household.backupPhone && (
                  <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-medium shrink-0">
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                    <span>إضافي 2:</span>
                    <span dir="ltr" className="mr-auto">{household.backupPhone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Income Half */}
            <div className="space-y-2 flex flex-col min-w-0">
              <h5 className="text-[11px] font-bold text-slate-500 dark:text-slate-400">الدخل</h5>
              <div className={cn("overflow-y-auto pr-1 custom-scrollbar flex-col flex gap-1.5", isCompactIncome ? "max-h-[140px]" : "max-h-[140px]")}>
                 {(household.incomeSources || []).map((income) => (
                   <div key={income.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-100 dark:border-slate-700 p-1.5 shrink-0 gap-2">
                     <div className="flex items-center gap-1.5 min-w-0">
                        <span className={cn("shrink-0 rounded-full w-1.5 h-1.5", income.verified ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600")} title={income.verified ? "موثق" : "غير موثق"} />
                        <span className="font-semibold text-slate-700 dark:text-slate-300 text-[10px] truncate" title={getIncomeLabel(income.channel)}>
                          {getIncomeLabel(income.channel)}
                        </span>
                     </div>
                     <div className="font-bold text-slate-900 dark:text-emerald-400 text-[10px] shrink-0" dir="ltr">
                       {Number(income.monthlyAmount || 0).toLocaleString("ar-EG")} <span className="text-[8px] text-slate-500 font-normal">ج.م</span>
                     </div>
                   </div>
                 ))}
                 {(!household.incomeSources || household.incomeSources.length === 0) && (
                   <div className="text-[10px] text-slate-500 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700 text-center">لا يوجد دخل</div>
                 )}
              </div>
            </div>
          </div>
        </div>

        {/* LEFT: Layers */}
        <div className="space-y-4 border-t md:border-t-0 md:border-r border-slate-200 dark:border-slate-700 pt-4 md:pt-0 md:pr-6">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">تفاصيل التقييم الطبقي</h4>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-x-2 gap-y-4">
            {layers.map((layer, index) => {
              const label = getLayerLabel(layer.layerId);
              const circleColors = [
                "text-emerald-500",
                "text-sky-500",
                "text-amber-500",
                "text-rose-500",
                "text-indigo-500",
                "text-fuchsia-500",
                "text-teal-500",
                "text-orange-500"
              ];
              const strokeColor = circleColors[index % circleColors.length];
              
              return (
                <div key={layer.layerId} className="flex flex-col items-center justify-center gap-1.5" title={label}>
                  <div className="relative flex items-center justify-center w-10 h-10">
                     <svg viewBox="0 0 36 36" className="absolute inset-0 w-full h-full -rotate-90">
                        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="currentColor" strokeWidth="3.5" className="text-slate-100 dark:text-slate-800" />
                        <path strokeDasharray={`${layer.progress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" className={strokeColor} />
                     </svg>
                     <span className="absolute text-[10px] font-bold text-slate-800 dark:text-slate-200">{Math.round(layer.progress)}%</span>
                  </div>
                  <span className="text-[9px] font-medium text-slate-500 dark:text-slate-400 text-center leading-[1.2] w-full line-clamp-2 px-1">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
          {layers.length === 0 && (
             <div className="text-xs text-slate-500 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 text-center">لا توجد تفاصيل تقييم متاحة.</div>
          )}
        </div>
        
      </div>
    </div>
  );
}

function MiniSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="mb-2 text-xs font-semibold text-slate-900 dark:text-slate-100">{title}</p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function IncomeLine({ income }: { income: IncomeSourceDto }) {
  return (
    <p className="truncate text-xs text-slate-600 dark:text-slate-300">
      {income.channel} · {Number(income.monthlyAmount || 0).toLocaleString("ar-EG")} ج · {income.verified}
    </p>
  );
}

function SortableTh({ label, column, sorts, onSort, center }: { label: string; column: string; sorts: SortItem[]; onSort: (column: string, event?: React.MouseEvent) => void; center?: boolean }) {
  return (
    <th className={cn("px-3 py-3", center ? "text-center" : "text-start")}>
      <button className={cn("inline-flex items-center gap-1", center && "justify-center")} onClick={(event) => onSort(column, event)}>
        {label}
        <SortIndicator column={column} sorts={sorts} />
      </button>
    </th>
  );
}

function SortIndicator({ column, sorts }: { column: string; sorts: SortItem[] }) {
  const index = sorts.findIndex((item) => item.column === column);
  if (index === -1) return <span className="text-slate-400 dark:text-slate-500">↕</span>;
  return (
    <span className="inline-flex items-center gap-0.5 text-green-600">
      {sorts[index].direction === "asc" ? "↑" : "↓"}
      {sorts.length > 1 && <span className="rounded-full bg-green-100 px-1 text-[10px] text-green-700">{index + 1}</span>}
    </span>
  );
}

function NameLine({ person, fallback, highlight, gender, strong }: { person?: PersonDto; fallback: string; highlight: string; gender: "MALE" | "FEMALE"; strong?: boolean }) {
  const age = person ? getAge(person) : null;
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <span className={cn("inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold", gender === "FEMALE" ? "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300" : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300")}>{age ?? "-"}</span>
      <span className={cn("truncate", strong ? "text-sm font-bold text-slate-900 dark:text-slate-100" : "text-xs text-slate-600 dark:text-slate-300")}>{highlightText(person?.name || fallback, highlight)}</span>
    </div>
  );
}

function TagList({ household }: { household: HouseholdDto }) {
  const tags = getTags(household);
  if (!tags.length) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {tags.slice(0, 3).map((tag) => <span key={tag.label} className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-medium", tag.className)}>{tag.label}</span>)}
      {tags.length > 3 && <span className="text-[10px] text-slate-400 dark:text-slate-500">+{tags.length - 3}</span>}
    </div>
  );
}

function getTags(household: HouseholdDto) {
  const tags = [];
  const persons = household.persons || [];
  const personTags = household.personTags;
  if (personTags?.hasDiseases || persons.some((person) => (person.diseases?.length || 0) > 0)) tags.push({ label: "مرض مزمن", className: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300", dotClass: "bg-amber-400" });
  if (personTags?.hasDisabilities || persons.some((person) => (person.disabilities?.length || 0) > 0)) tags.push({ label: "إعاقة", className: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300", dotClass: "bg-blue-400" });
  if (personTags?.hasStudent || persons.some((person) => person.isStudent)) tags.push({ label: "طالب", className: "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300", dotClass: "bg-sky-400" });
  if (personTags?.hasBride || persons.some((person) => person.isBride)) tags.push({ label: "عروسة", className: "bg-pink-50 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300", dotClass: "bg-pink-400" });
  if (personTags?.hasOrphan || persons.some((person) => person.isOrphan)) tags.push({ label: "يتيم", className: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300", dotClass: "bg-purple-400" });
  if (persons.some((person) => person.isPrisoner)) tags.push({ label: "سجين", className: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300", dotClass: "bg-slate-500" });
  return tags;
}

function CompactTags({ household }: { household: HouseholdDto }) {
  const tags = getTags(household);
  if (!tags.length) return null;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="inline-flex gap-1">
          {tags.slice(0, 3).map((tag) => <span key={tag.label} className={cn("inline-flex h-2 w-2 rounded-full", tag.dotClass)} />)}
          {tags.length > 3 && <span className="inline-flex h-3 w-3 items-center justify-center rounded-full bg-slate-200 text-[8px] text-slate-700 dark:bg-slate-800 dark:text-slate-300">+{tags.length - 3}</span>}
        </div>
      </TooltipTrigger>
      <TooltipContent>{tags.map(t => t.label).join("، ")}</TooltipContent>
    </Tooltip>
  );
}

function PdfLink({ url }: { url?: string | null }) {
  const t = useTranslations("households");
  if (!url) {
    return (
      <Tooltip>
        <TooltipTrigger asChild><span className="rounded-full p-1 text-slate-400 dark:text-slate-500 opacity-50"><Paperclip className="h-4 w-4" /></span></TooltipTrigger>
        <TooltipContent>{t("table.tooltips.noFile")}</TooltipContent>
      </Tooltip>
    );
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild><a href={url} target="_blank" rel="noreferrer" className="rounded-full p-1 text-slate-400 dark:text-slate-500 hover:text-green-500"><Paperclip className="h-4 w-4" /></a></TooltipTrigger>
      <TooltipContent>{t("table.tooltips.openFile")}</TooltipContent>
    </Tooltip>
  );
}

function IconLink({ href, label, className, children }: { href: string; label: string; className: string; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button asChild variant="ghost" size="icon" className={cn("h-auto w-auto rounded-full p-1.5 transition-colors", className)}><Link href={href}>{children}</Link></Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function PageButton({ disabled, onClick, children }: { disabled: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button disabled={disabled} onClick={onClick} className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700/50 px-4 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40">
      {children}
    </button>
  );
}

function SkeletonRow({ visibleColumns }: { visibleColumns: HouseholdColumnKey[] }) {
  return (
    <tr className="h-[68px] border-b border-slate-100 dark:border-slate-800">
      {visibleColumns.map((column) => (
        <td key={column} className="px-3">
          <Skeleton className="h-4 w-full animate-pulse bg-slate-200 dark:bg-slate-700" />
        </td>
      ))}
    </tr>
  );
}

function parseSort(sort: string | null): SortItem[] {
  if (!sort) return [];
  return sort.split(",").slice(0, 2).map((item) => {
    const [column, direction] = item.split(":");
    return column ? { column, direction: direction === "desc" ? "desc" : "asc" } : null;
  }).filter(Boolean) as SortItem[];
}

function sortRows(rows: HouseholdDto[], sorts: SortItem[]) {
  if (!sorts.length) return rows;
  return [...rows].sort((a, b) => {
    for (const sort of sorts) {
      const compared = compareValues(sortValue(a, sort.column), sortValue(b, sort.column));
      if (compared !== 0) return sort.direction === "asc" ? compared : -compared;
    }
    return 0;
  });
}

function sortValue(household: HouseholdDto, column: string) {
  const wife = findPerson(household, "SPOUSE", "FEMALE");
  const husband = findPerson(household, "HEAD", "MALE");
  const score = household.latestScore || household.scoreResults?.[0];
  const values: Record<string, string | number> = {
    code: shortCode(household.code),
    wifeName: wife?.name || household.spouseName || "",
    husbandName: husband?.name || household.headName || "",
    address: household.district || household.village || "",
    dependentCount: household.dependentCount || 0,
    totalPersons: household.totalMembersCount ?? household.totalPersons ?? 0,
    totalIncome: household.totalMonthlyIncome || 0,
    score: Number(score?.normalizedPercent || -1),
    classification: score?.classificationTag || household.latestClassification || "",
  };
  return values[column] ?? "";
}

function compareValues(a: string | number, b: string | number) {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), "ar");
}

function paginationWindow(current: number, total: number): Array<number | "ellipsis"> {
  if (total <= 5) return Array.from({ length: total }, (_, index) => index + 1);
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = Array.from(pages).filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);
  const result: Array<number | "ellipsis"> = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push("ellipsis");
    result.push(sorted[i]);
  }
  return result;
}

function findPerson(household: HouseholdDto, role: string, gender: string) {
  return household.persons?.find((person) => person.role === role) || household.persons?.find((person) => person.gender === gender);
}

function shortCode(code: string) {
  return code.match(/(\d{4})$/)?.[1] || code.slice(-4);
}

function getAge(person: PersonDto) {
  const fromId = ageFromNationalId(person.nationalId);
  if (fromId != null) return fromId;
  if (!person.birthDate) return null;
  const birth = new Date(person.birthDate);
  if (Number.isNaN(birth.getTime())) return null;
  return ageFromYear(birth.getFullYear());
}

function ageFromNationalId(nationalId?: string) {
  if (!nationalId || !/^([23])(\d{2})(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{7}$/.test(nationalId)) return null;
  const year = (nationalId[0] === "2" ? 1900 : 2000) + Number(nationalId.slice(1, 3));
  return ageFromYear(year);
}

function ageFromYear(year: number) {
  return new Date().getFullYear() - year;
}

function cleanEgyptPhone(phone: string) {
  return phone.replace(/\D/g, "").replace(/^20/, "");
}

function extractClassification(note?: string) {
  if (!note) return null;
  const tags = ["كفالة أيتام", "أيتام", "فقراء", "مساكين", "أسر سجناء", "ملف إعاقة", "ذوو إعاقة", "مسنون", "علاج شهري", "أمراض مزمنة", "حالات هجر", "طلاب علم", "طالب علم", "كبار سن", "مساعدات", "مساعدات موسمية", "لا يستحق المساعدة"];
  return tags.find((tag) => note.includes(tag)) || null;
}

function highlightText(text: string, query: string) {
  const term = query.trim();
  if (!term) return text;
  const index = text.toLowerCase().indexOf(term.toLowerCase());
  if (index === -1) return text;
  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded bg-yellow-200 px-0.5 text-inherit dark:bg-yellow-800">{text.slice(index, index + term.length)}</mark>
      {text.slice(index + term.length)}
    </>
  );
}

function relativeDate(value?: string | null) {
  if (!value) return "غير محدد";
  const date = new Date(value);
  const days = Math.max(0, Math.floor((Date.now() - date.getTime()) / 86400000));
  if (days === 0) return "اليوم";
  if (days === 1) return "منذ يوم";
  if (days < 7) return `منذ ${days} أيام`;
  return date.toLocaleDateString("ar-EG");
}

function roleLabel(role?: string) {
  const labels: Record<string, string> = { HEAD: "رب الأسرة", SPOUSE: "الزوجة", CHILD: "طفل", DEPENDENT_ADULT: "معال" };
  return labels[role || ""] || "فرد";
}

export function normalizeLayers(value: unknown): Array<{ layerId: string; normalizedScore: number; maxScore: number; progress: number; isNegative: boolean }> {
  const layers = Array.isArray(value) ? value as any[] : [];
  return layers.map((layer) => {
    let rawScore = layer.score;
    if (rawScore === undefined || rawScore === null || rawScore === "") rawScore = layer.cappedScore;
    
    let score = Number(rawScore);
    if (isNaN(score)) score = 0;

    let capVal = Number(layer.cap);
    if (isNaN(capVal) || capVal === 0) capVal = 1;
    
    const isNeg = score < 0 || capVal < 0;
    const progress = Math.min(100, (Math.abs(score) / Math.abs(capVal)) * 100);

    return { 
      ...layer,
      layerId: layer.layerId, 
      normalizedScore: score,
      maxScore: capVal,
      progress: Math.round(progress),
      isNegative: isNeg
    };
  });
}
