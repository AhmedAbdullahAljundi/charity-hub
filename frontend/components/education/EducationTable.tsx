"use client";

import React from "react";
import { format } from "date-fns";
import { arEG } from "date-fns/locale";
import { useTranslations } from "next-intl";
import { Eye, Pencil, Trash2, ArrowUpDown, ArrowUp, ArrowDown, GraduationCap, Link, MoreVertical } from "lucide-react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { EducationRecordDto } from "@/lib/api/education-api";
import type { PaginatedMeta } from "@/lib/types/api";

interface EducationTableProps {
  list: EducationRecordDto[];
  loading: boolean;
  pagination: PaginatedMeta | null;
  searchQuery?: string;
}

export default function EducationTable({ list, loading, pagination, searchQuery }: EducationTableProps) {
  const t = useTranslations("education");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const shortCode = (code: string) => code?.substring(code.length - 4) || "";
  
  const cleanEgyptPhone = (phone: string | null) => {
    if (!phone) return null;
    let clean = phone.replace(/\D/g, "");
    if (clean.startsWith("0")) clean = clean.substring(1);
    if (!clean.startsWith("20")) clean = "20" + clean;
    return "+" + clean;
  };

  const getLevelBadgeColor = (level: string) => {
    switch(level) {
      case "NONE": return "bg-slate-100 text-slate-700 border-slate-200";
      case "KINDERGARTEN": return "bg-pink-100 text-pink-700 border-pink-200";
      case "PRIMARY": return "bg-blue-100 text-blue-700 border-blue-200";
      case "PREPARATORY": return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "SECONDARY_GENERAL":
      case "SECONDARY_INDUSTRIAL_COMMERCIAL_BOYS":
      case "SECONDARY_INDUSTRIAL_COMMERCIAL_GIRLS": return "bg-purple-100 text-purple-700 border-purple-200";
      case "UNIVERSITY_SCIENTIFIC":
      case "UNIVERSITY_THEORETICAL": return "bg-violet-100 text-violet-700 border-violet-200";
      case "SPECIAL_EDUCATION": return "bg-orange-100 text-orange-700 border-orange-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return "bg-slate-200 text-slate-500";
    if (score >= 85) return "bg-emerald-500 text-white";
    if (score >= 75) return "bg-green-400 text-white";
    if (score >= 65) return "bg-amber-400 text-slate-900";
    if (score >= 50) return "bg-orange-400 text-white";
    return "bg-red-400 text-white";
  };

  const currentSort = searchParams.get("sort") || "totalScore:desc";

  const handleSort = (field: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const [currentField, currentOrder] = currentSort.split(":");
    let newOrder = "desc";
    if (currentField === field && currentOrder === "desc") newOrder = "asc";
    params.set("sort", `${field}:${newOrder}`);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handlePage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.replace(`${pathname}?${params.toString()}`);
  };

  const renderSortIcon = (field: string) => {
    const [currentField, currentOrder] = currentSort.split(":");
    if (currentField !== field) return <ArrowUpDown className="w-3 h-3 opacity-30" />;
    return currentOrder === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />;
  };

  const thClass = "text-start p-3 align-middle cursor-pointer hover:bg-indigo-500/5 transition-colors select-none";
  const tdClass = "p-3 align-middle border-b border-slate-100 dark:border-slate-800 text-sm";

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="flex-1 overflow-auto" style={{ scrollbarGutter: "stable" }}>
        <table className="w-full text-sm border-collapse relative">
          <thead className="bg-indigo-500/5 dark:bg-indigo-500/10 text-[13px] font-semibold uppercase tracking-[0.05em] text-indigo-800 dark:text-indigo-400 sticky top-0 z-10 shadow-sm backdrop-blur-md">
            <tr className="border-b-2 border-indigo-500/10 dark:border-indigo-500/20">
              <th className={thClass} onClick={() => handleSort("householdId")}>
                <div className="flex items-center gap-1">رقم القيد {renderSortIcon("householdId")}</div>
              </th>
              <th className={thClass} onClick={() => handleSort("personId")}>
                <div className="flex items-center gap-1">اسم الطالب {renderSortIcon("personId")}</div>
              </th>
              <th className={cn(thClass, "cursor-default hover:bg-transparent")}>المرحلة والصف</th>
              <th className={thClass} onClick={() => handleSort("averageScore")}>
                <div className="flex items-center gap-1">تقييم الدراسة {renderSortIcon("averageScore")}</div>
              </th>
              <th className={thClass} onClick={() => handleSort("quranProgress")}>
                <div className="flex items-center gap-1">تقييم القرآن {renderSortIcon("quranProgress")}</div>
              </th>
              <th className={thClass} onClick={() => handleSort("totalScore")}>
                <div className="flex items-center gap-1">التقييم العام {renderSortIcon("totalScore")}</div>
              </th>
              <th className={thClass} onClick={() => handleSort("updatedAt")}>
                <div className="flex items-center gap-1">آخر تحديث {renderSortIcon("updatedAt")}</div>
              </th>
              <th className={cn(thClass, "text-center cursor-default hover:bg-transparent w-8 px-1")}>
                <span className="sr-only">أكشن</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className={tdClass}><Skeleton className="h-5 w-12 dark:bg-slate-800" /></td>
                  <td className={tdClass}>
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32 dark:bg-slate-800" />
                      <Skeleton className="h-3 w-20 dark:bg-slate-800" />
                    </div>
                  </td>
                  <td className={tdClass}><Skeleton className="h-8 w-24 dark:bg-slate-800" /></td>
                  <td className={tdClass}><Skeleton className="h-8 w-32 dark:bg-slate-800" /></td>
                  <td className={tdClass}><Skeleton className="h-8 w-32 dark:bg-slate-800" /></td>
                  <td className={tdClass}><Skeleton className="h-8 w-12 rounded-full dark:bg-slate-800" /></td>
                  <td className={tdClass}><Skeleton className="h-4 w-16 dark:bg-slate-800" /></td>
                  <td className={tdClass}>
                    <div className="flex gap-1 justify-center">
                      <Skeleton className="h-8 w-8 rounded-md dark:bg-slate-800" />
                      <Skeleton className="h-8 w-8 rounded-md dark:bg-slate-800" />
                    </div>
                  </td>
                </tr>
              ))
            ) : list.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-12 text-center text-slate-500 dark:text-slate-400">
                  <GraduationCap className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                  <p className="text-lg font-medium">{t("noRecords")}</p>
                </td>
              </tr>
            ) : (
              list.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className={tdClass}>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300" title={r.household.code}>
                      {shortCode(r.household.code)}
                    </span>
                  </td>
                  <td className={tdClass}>
                    <div className="flex items-start gap-2">
                      <div className={cn("shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5", 
                        r.person.gender === "FEMALE" ? "bg-pink-100 text-pink-700 dark:bg-pink-900/60 dark:text-pink-300" : "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300"
                      )}>
                        {r.person.age || "?"}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100 leading-tight">{r.person.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5" title={r.household.headName || ""}>
                          عائلة {r.household.headName}
                        </p>
                        <div className="flex gap-1 mt-1">
                          {r.isRepeating && <Badge variant="outline" className="text-[9px] h-4 px-1 border-rose-200 text-rose-700 bg-rose-50 dark:border-rose-900/50 dark:text-rose-400 dark:bg-rose-900/20">راسب</Badge>}
                          {r.needsLevelUpdate && <Badge variant="outline" className="text-[9px] h-4 px-1 border-amber-200 text-amber-700 bg-amber-50 dark:border-amber-900/50 dark:text-amber-400 dark:bg-amber-900/20">تحديث</Badge>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className={tdClass}>
                    <div className="flex flex-col gap-1">
                      <Badge variant="outline" className={cn("text-xs font-normal border whitespace-nowrap w-fit", getLevelBadgeColor(r.studentLevel))}>
                        {t(`levels.${r.studentLevel}`)}
                      </Badge>
                      {r.gradeYear && <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">الصف {r.gradeYear}</span>}
                      {r.isSpecialEducation && <Badge variant="outline" className="text-[9px] h-4 px-1 border-orange-200 text-orange-700 bg-orange-50 dark:border-orange-900/50 dark:text-orange-400 dark:bg-orange-900/20 w-fit">تعليم خاص</Badge>}
                    </div>
                  </td>
                  <td className={tdClass}>
                    {r.averageScore !== null ? (
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className={cn("px-1.5 rounded-sm text-[10px] font-bold text-white", getScoreColor(r.averageScore))}>
                            {r.overallGrade ? t(`gradesShort.${r.overallGrade}`) : "-"}
                          </span>
                          <span className="font-mono font-medium dark:text-slate-300">{r.averageScore}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className={cn("h-full", getScoreColor(r.averageScore))} style={{ width: `${Math.min(r.averageScore, 100)}%` }} />
                        </div>
                      </div>
                    ) : <span className="text-slate-400 dark:text-slate-500">—</span>}
                  </td>
                  <td className={tdClass}>
                    {r.quranJuzCount && r.quranJuzCount > 0 ? (
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-1.5 rounded-sm text-[10px]">
                            {r.quranGrade ? `${r.quranGrade}%` : "-"}
                          </span>
                          <span className="text-xs text-slate-700 dark:text-slate-300 font-medium" title={r.quranLastSurah || ""}>
                            {r.quranJuzCount} جزء {r.quranLastSurah ? `(${r.quranLastSurah})` : ""}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-0.5">
                          <div className="h-full bg-amber-400 dark:bg-amber-500" style={{ width: `${Math.min(r.quranProgress || 0, 100)}%` }} />
                        </div>
                      </div>
                    ) : <span className="text-slate-400 dark:text-slate-500">—</span>}
                  </td>
                  <td className={tdClass}>
                    {r.totalScore !== null ? (
                      <div className="flex items-center gap-2">
                        <div className={cn("w-9 h-9 rounded-full flex flex-col items-center justify-center shadow-sm text-white", getScoreColor(r.totalScore))}>
                          <span className="font-mono text-sm font-bold leading-none">{Math.round(r.totalScore)}</span>
                          <span className="text-[8px] leading-none opacity-80 mt-0.5">%</span>
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[10px] text-slate-500 dark:text-slate-400">عام</span>
                        </div>
                      </div>
                    ) : <span className="text-slate-400 dark:text-slate-500">—</span>}
                  </td>
                  <td className={tdClass}>
                    <span className="text-xs text-slate-600 dark:text-slate-400" title={format(new Date(r.updatedAt), "PPP", { locale: arEG })}>
                      {format(new Date(r.updatedAt), "dd/MM/yyyy")}
                    </span>
                  </td>
                  <td className={tdClass}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-100">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/education/${r.id}`)} className="flex items-center gap-2 cursor-pointer">
                          <Eye className="h-4 w-4 text-sky-600" /> عرض
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer text-rose-500 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-900/30">
                          <Trash2 className="h-4 w-4" /> حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t("table.showing", { from: ((pagination.page - 1) * pagination.limit) + 1, to: Math.min(pagination.page * pagination.limit, pagination.total), total: pagination.total })}
          </p>
          <div className="flex items-center gap-1" dir="ltr">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={pagination.page <= 1}
              onClick={() => handlePage(pagination.page - 1)}
            >
              {"<"}
            </Button>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === pagination.pages || Math.abs(p - pagination.page) <= 1)
              .map((p, i, arr) => (
                <React.Fragment key={p}>
                  {i > 0 && p - arr[i - 1] > 1 && <span className="px-2 text-slate-400">...</span>}
                  <Button
                    variant={p === pagination.page ? "default" : "outline"}
                    size="sm"
                    className={cn("h-8 w-8 p-0", p === pagination.page && "bg-[var(--brand)] text-white hover:bg-[var(--brand-dark)]")}
                    onClick={() => handlePage(p)}
                  >
                    {p}
                  </Button>
                </React.Fragment>
              ))}
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={pagination.page >= pagination.pages}
              onClick={() => handlePage(pagination.page + 1)}
            >
              {">"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
