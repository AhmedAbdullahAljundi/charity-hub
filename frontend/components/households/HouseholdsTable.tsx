"use client";

import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Edit, Eye, FileText, MessageCircle, Paperclip, Trash2 } from "lucide-react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
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
  select: "24px",
  code: "72px",
  family: "200px",
  address: "150px",
  phone: "100px",
  dependents: "64px",
  total: "60px",
  income: "110px",
  score: "120px",
  classification: "120px",
  actions: "80px",
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

const classificationPills: Record<string, string> = {
  "أيتام": "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300",
  "فقراء": "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300",
  "مساكين": "bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300",
  "أسر سجناء": "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  "ذوو إعاقة": "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
  "مسنون": "bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300",
  "أمراض مزمنة": "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/60 dark:text-yellow-300",
  "حالات هجر": "bg-pink-50 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300",
  "طالب علم": "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
  "كبار سن": "bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300",
  "لا يستحق": "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
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
    <div className="relative grid min-h-0 grid-rows-[auto_1fr_48px] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      <table className="w-full table-fixed border-collapse">
        <ColumnGroup visibleColumns={visibleColumns} />
        <thead className="bg-[var(--surface-raised)] text-[13px] font-semibold uppercase tracking-[0.05em] text-[var(--text-secondary)] dark:bg-[#1E293B]">
          <tr className="border-b-2 border-[var(--border)]">
            {show("select") && (
              <th className="px-2 py-3">
                <Checkbox checked={sortedList.length > 0 && sortedList.every((row) => selectedIds.includes(row.id))} onCheckedChange={toggleAll} />
              </th>
            )}
            {show("code") && <SortableTh label="رقم القيد" column="code" sorts={sorts} onSort={toggleSort} />}
            {show("family") && (
              <th className="px-3 py-3 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="inline-flex items-center gap-1">
                      الأسرة
                      <ChevronDown className="h-3.5 w-3.5" />
                      <SortIndicator column="wifeName" sorts={sorts} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => toggleSort("wifeName")}>ترتيب باسم الزوجة ↑↓</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleSort("husbandName")}>ترتيب باسم الزوج ↑↓</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </th>
            )}
            {show("address") && <SortableTh label="العنوان" column="address" sorts={sorts} onSort={toggleSort} />}
            {show("phone") && <th className="px-3 py-3 text-center">الهاتف</th>}
            {show("dependents") && (
              <SortableTh label="أطفال/معالون" column="dependentCount" sorts={sorts} onSort={toggleSort} center />
            )}
            {show("total") && <SortableTh label="إجمالي الأسرة" column="totalPersons" sorts={sorts} onSort={toggleSort} center />}
            {show("income") && <SortableTh label="إجمالي الدخل" column="totalIncome" sorts={sorts} onSort={toggleSort} />}
            {show("score") && <SortableTh label="التقييم" column="score" sorts={sorts} onSort={toggleSort} />}
            {show("classification") && <SortableTh label="التصنيف" column="classification" sorts={sorts} onSort={toggleSort} />}
            {show("actions") && <th className="px-2 py-3" aria-label="إجراءات" />}
          </tr>
        </thead>
      </table>

      <div ref={bodyRef} className="min-h-0 overflow-y-auto" style={{ maxHeight: "calc(100vh - 280px)" }}>
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
                  <div className="mx-auto flex max-w-sm flex-col items-center gap-3 text-[var(--text-secondary)]">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--surface-raised)] text-[var(--text-muted)]">
                      <FileText className="h-7 w-7" />
                    </div>
                    <p className="text-base font-semibold text-[var(--text-primary)]">لا توجد أسر تطابق البحث</p>
                    <Button variant="outline" onClick={() => router.replace(pathname)}>
                      مسح الفلاتر
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
          <span className="font-medium text-white">{selectedIds.length.toLocaleString("ar-EG")} أسر محددة</span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="border-green-500 bg-green-700 text-white hover:bg-green-800 hover:text-white">حساب التقييم للكل</Button>
            <Button size="sm" variant="outline" className="border-green-500 bg-green-700 text-white hover:bg-green-800 hover:text-white">تصدير</Button>
            <Button size="sm" variant="ghost" className="text-green-50 hover:bg-green-700 hover:text-white" onClick={() => onSelectedIdsChange([])}>إلغاء</Button>
          </div>
        </div>
      )}

      <div className="flex h-12 items-center justify-between border-t border-[var(--border)] bg-[var(--surface)] px-4">
        <p className="text-sm text-[var(--text-muted)]">
          عرض {from.toLocaleString("ar-EG")}-{to.toLocaleString("ar-EG")} من {total.toLocaleString("ar-EG")} أسرة
        </p>
        <div className="flex items-center gap-1">
          <PageButton disabled={currentPage <= 1} onClick={() => updatePage(currentPage - 1)}>
            <ChevronRight className="h-4 w-4" />
            السابق
          </PageButton>
          {paginationWindow(currentPage, totalPages).map((page, index) =>
            page === "ellipsis" ? (
              <span key={`ellipsis-${index}`} className="px-2 text-[var(--text-muted)]">...</span>
            ) : (
              <button
                key={page}
                onClick={() => updatePage(page)}
                className={cn(
                  "h-8 w-8 rounded-lg border border-[var(--border)] text-sm transition-colors hover:bg-[var(--surface-raised)]",
                  page === currentPage && "border-green-600 bg-green-600 text-white hover:bg-green-600"
                )}
              >
                {page.toLocaleString("ar-EG")}
              </button>
            )
          )}
          <PageButton disabled={currentPage >= totalPages} onClick={() => updatePage(currentPage + 1)}>
            التالي
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
  const show = (key: HouseholdColumnKey) => visibleColumns.includes(key);
  const wife = findPerson(household, "SPOUSE", "FEMALE");
  const husband = findPerson(household, "HEAD", "MALE");
  const score = household.latestScore || household.scoreResults?.[0];
  const recommendation = score?.systemRecommendation;
  const percent = score ? Math.round(Number(score.normalizedPercent || 0)) : null;
  const income = Math.abs(Number(household.totalMonthlyIncome || 0));
  const classification = score?.classificationTag || extractClassification(household.latestClassification || score?.decisionNote);
  const phones = [household.primaryPhone, household.secondaryPhone].filter(Boolean) as string[];
  const familyName = wife?.name || household.spouseName || husband?.name || household.headName || household.code;

  return (
    <tr className={cn("group h-[56px] border-b border-[var(--border-subtle)] text-sm transition-[background-color] duration-150 hover:bg-[var(--surface-raised)]", selected && "bg-green-50/60 dark:bg-green-950/20")}>
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
            <button onClick={() => onExpand(household.id)} className="rounded p-0.5 text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-green-600">
              <ChevronLeft className={cn("h-3.5 w-3.5 transition-transform", expanded && "-rotate-90")} />
            </button>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="font-mono text-sm font-bold text-[var(--text-primary)]">{shortCode(household.code)}</span>
              </TooltipTrigger>
              <TooltipContent>{household.code}</TooltipContent>
            </Tooltip>
          </div>
        </td>
      )}
      {show("family") && (
        <td className="px-3 py-2 align-middle">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 space-y-1">
              <NameLine person={wife} fallback={household.spouseName || "-"} highlight={searchQuery} gender="FEMALE" strong />
              <div className="flex items-center gap-2">
                <NameLine person={husband} fallback={household.headName || "-"} highlight={searchQuery} gender="MALE" />
                <CompactTags household={household} />
              </div>
            </div>
            <PdfLink url={household.pdfUrl} />
          </div>
        </td>
      )}
      {show("address") && (
        <td className="px-3 align-middle">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="rounded border border-[var(--border)] bg-[var(--surface-raised)] px-1.5 py-0.5 font-mono text-[11px] text-[var(--text-secondary)]">
                {household.addressRegion || "--"}
              </span>
              <span className="truncate text-sm text-[var(--text-secondary)]">{household.district || household.village || "-"}</span>
            </div>
            <p className="line-clamp-2 text-xs text-[var(--text-muted)]">
              {[household.addressStreet, household.addressDetails || household.address].filter(Boolean).join(" - ") || "-"}
            </p>
          </div>
        </td>
      )}
      {show("phone") && (
        <td className="px-2 text-center align-middle">
          <div className="flex flex-col items-center gap-1">
            {phones.length ? phones.slice(0, 2).map((phone, index) => (
              <span key={phone} dir="ltr" className={cn("rounded px-2 py-0.5 text-xs text-[var(--text-secondary)]", index === 0 ? "bg-slate-50 dark:bg-slate-700" : "bg-green-50 dark:bg-green-900")}>
                {phone}
              </span>
            )) : <span className="text-[var(--text-muted)]">—</span>}
            {household.primaryPhone && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <a href={`https://api.whatsapp.com/send?phone=+20${cleanEgyptPhone(household.primaryPhone)}`} target="_blank" rel="noreferrer" className="rounded-full p-1 text-[#25D366] hover:bg-emerald-50 dark:hover:bg-emerald-900/30">
                    <MessageCircle className="h-3.5 w-3.5" />
                  </a>
                </TooltipTrigger>
                <TooltipContent>فتح محادثة واتساب</TooltipContent>
              </Tooltip>
            )}
          </div>
        </td>
      )}
      {show("dependents") && (
        <td className="px-2 text-center align-middle">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="font-bold text-[var(--text-primary)]">{household.dependentCount ?? 0}</span>
            </TooltipTrigger>
            <TooltipContent>الأطفال والمعالون المحتسَبون في التقييم</TooltipContent>
          </Tooltip>
        </td>
      )}
      {show("total") && <td className="px-2 text-center align-middle font-bold text-[var(--text-secondary)]">{household.totalMembersCount ?? household.totalPersons ?? 0}</td>}
      {show("income") && (
        <td className="px-3 align-middle">
          <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-medium", recommendation ? eligibilityPills[recommendation] : "bg-slate-100 text-slate-500 dark:bg-slate-800")}>
            {income.toLocaleString("ar-EG")} ج
          </span>
        </td>
      )}
      {show("score") && (
        <td className="px-3 align-middle">
          {score && percent != null ? (
            <div className="space-y-1">
              <div className="h-2 overflow-hidden rounded bg-[var(--surface-raised)]">
                <div className={cn("h-full rounded", recommendation ? eligibilityBars[recommendation] : "bg-slate-300")} style={{ width: `${Math.min(Math.max(percent, 0), 100)}%` }} />
              </div>
              <p className="text-xs font-bold text-[var(--text-primary)]">{percent}%</p>
              <p className="truncate text-xs text-[var(--text-muted)]">{recommendation ? eligibilityLabels[recommendation] : "-"}</p>
            </div>
          ) : <span className="text-[var(--text-muted)]">—</span>}
        </td>
      )}
      {show("classification") && (
        <td className="px-3 align-middle">
          {classification ? (
            <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-medium", classificationPills[classification] || "bg-slate-100 text-slate-500 dark:bg-slate-800")}>{classification}</span>
          ) : (
            <span className="inline-flex rounded-full border border-dashed border-[var(--border)] px-3 py-1 text-xs text-[var(--text-muted)]">لم يبت بعد</span>
          )}
        </td>
      )}
      {show("actions") && (
        <td className="px-2 text-center align-middle">
          <div className="flex items-center justify-center gap-1">
            <IconLink href={`/dashboard/households/${household.id}/wizard`} label="عرض" className="text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30"><Eye className="h-4 w-4" /></IconLink>
            <IconLink href={`/dashboard/households/${household.id}/wizard`} label="تعديل" className="text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"><Edit className="h-4 w-4" /></IconLink>
            {isAdmin && (
              <AlertDialog>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertDialogTrigger asChild>
                      <button className="rounded-full p-1.5 text-rose-400 transition-colors hover:bg-rose-50 dark:hover:bg-rose-900/30"><Trash2 className="h-4 w-4" /></button>
                    </AlertDialogTrigger>
                  </TooltipTrigger>
                  <TooltipContent>حذف</TooltipContent>
                </Tooltip>
                <AlertDialogContent dir="rtl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>حذف الأسرة</AlertDialogTitle>
                    <AlertDialogDescription>هل تريد حذف أسرة {familyName}؟ لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                    <AlertDialogAction disabled={deleting} onClick={() => onDelete(household.id)} className="bg-rose-600 text-white hover:bg-rose-700">حذف</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </td>
      )}
    </tr>
  );
}

function ExpandedPanel({ household, open }: { household: HouseholdDto; open: boolean }) {
  const score = household.latestScore || household.scoreResults?.[0];
  const layers = normalizeLayers(score?.layerBreakdown);
  return (
    <div className={cn("grid overflow-hidden transition-[max-height,opacity] duration-200", open ? "max-h-[140px] opacity-100" : "max-h-0 opacity-0")}>
      <div className="grid min-h-[120px] grid-cols-3 gap-4 border-b border-[var(--border-subtle)] bg-[var(--surface-raised)] px-4 py-3">
        <MiniSection title="الأفراد">
          <div className="mb-2"><TagList household={household} /></div>
          {(household.persons || []).slice(0, 4).map((person) => (
            <p key={person.id} className="truncate text-xs text-[var(--text-secondary)]">{person.name} · {roleLabel(person.role)} · {getAge(person) ?? "-"} سنة</p>
          ))}
          <p className="mt-2 text-[10px] text-[var(--text-muted)]">آخر تعديل: {relativeDate(household.updatedAt)}</p>
        </MiniSection>
        <MiniSection title="الدخل">
          {(household.incomeSources || []).slice(0, 4).map((income) => <IncomeLine key={income.id} income={income} />)}
        </MiniSection>
        <MiniSection title="تفصيل التقييم">
          {layers.slice(0, 8).map((layer) => (
            <div key={layer.layerId} className="grid grid-cols-[36px_1fr] items-center gap-2">
              <span className="text-[10px] text-[var(--text-muted)]">{layer.layerId}</span>
              <div className="h-1.5 overflow-hidden rounded bg-[var(--surface)]">
                <div className="h-full rounded bg-green-500" style={{ width: `${layer.percent}%` }} />
              </div>
            </div>
          ))}
        </MiniSection>
      </div>
    </div>
  );
}

function MiniSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="mb-2 text-xs font-semibold text-[var(--text-primary)]">{title}</p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function IncomeLine({ income }: { income: IncomeSourceDto }) {
  return (
    <p className="truncate text-xs text-[var(--text-secondary)]">
      {income.channel} · {Number(income.monthlyAmount || 0).toLocaleString("ar-EG")} ج · {income.verified}
    </p>
  );
}

function SortableTh({ label, column, sorts, onSort, center }: { label: string; column: string; sorts: SortItem[]; onSort: (column: string, event?: React.MouseEvent) => void; center?: boolean }) {
  return (
    <th className={cn("px-3 py-3", center ? "text-center" : "text-right")}>
      <button className={cn("inline-flex items-center gap-1", center && "justify-center")} onClick={(event) => onSort(column, event)}>
        {label}
        <SortIndicator column={column} sorts={sorts} />
      </button>
    </th>
  );
}

function SortIndicator({ column, sorts }: { column: string; sorts: SortItem[] }) {
  const index = sorts.findIndex((item) => item.column === column);
  if (index === -1) return <span className="text-[var(--text-muted)]">↕</span>;
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
      <span className={cn("truncate", strong ? "text-sm font-bold text-[var(--text-primary)]" : "text-xs text-[var(--text-secondary)]")}>{highlightText(person?.name || fallback, highlight)}</span>
    </div>
  );
}

function TagList({ household }: { household: HouseholdDto }) {
  const tags = getTags(household);
  if (!tags.length) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {tags.slice(0, 3).map((tag) => <span key={tag.label} className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-medium", tag.className)}>{tag.label}</span>)}
      {tags.length > 3 && <span className="text-[10px] text-[var(--text-muted)]">+{tags.length - 3}</span>}
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
  if (!url) {
    return (
      <Tooltip>
        <TooltipTrigger asChild><span className="rounded-full p-1 text-[var(--text-muted)] opacity-50"><Paperclip className="h-4 w-4" /></span></TooltipTrigger>
        <TooltipContent>لا يوجد ملف</TooltipContent>
      </Tooltip>
    );
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild><a href={url} target="_blank" rel="noreferrer" className="rounded-full p-1 text-[var(--text-muted)] hover:text-green-500"><Paperclip className="h-4 w-4" /></a></TooltipTrigger>
      <TooltipContent>فتح الملف</TooltipContent>
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
    <button disabled={disabled} onClick={onClick} className="inline-flex h-8 items-center gap-1 rounded-lg border border-[var(--border)] px-4 text-sm transition-colors hover:bg-[var(--surface-raised)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40">
      {children}
    </button>
  );
}

function SkeletonRow({ visibleColumns }: { visibleColumns: HouseholdColumnKey[] }) {
  return (
    <tr className="h-[68px] border-b border-[var(--border-subtle)]">
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
  if (!nationalId || !/^[23]\d{13}$/.test(nationalId)) return null;
  const year = (nationalId[0] === "2" ? 1900 : 2000) + Number(nationalId.slice(1, 3));
  return ageFromYear(year);
}

function ageFromYear(year: number) {
  return new Date().getFullYear() - year;
}

function cleanEgyptPhone(phone: string) {
  return phone.replace(/\D/g, "").replace(/^20/, "").replace(/^0/, "");
}

function extractClassification(note?: string | null) {
  if (!note) return null;
  return Object.keys(classificationPills).find((key) => note.includes(key)) || null;
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

function normalizeLayers(value: unknown): Array<{ layerId: string; percent: number }> {
  const layers = Array.isArray(value) ? value as LayerBreakdownItem[] : [];
  return layers.map((layer) => {
    const score = Number(layer.cappedScore ?? layer.score ?? 0);
    const cap = Number(layer.cap ?? (score || 1));
    return { layerId: layer.layerId, percent: Math.min(100, Math.max(0, (score / cap) * 100)) };
  });
}
