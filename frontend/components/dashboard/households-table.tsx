"use client";

import React, { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { Eye, Edit, Trash2, Phone, SearchX, ArrowUpDown, FileText, MoreVertical } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import { ELIGIBILITY_TAILWIND, ELIGIBILITY_COLORS } from "@/lib/eligibility";
import type { HouseholdDto } from "@/lib/types/api";
import { useAuthStore } from "@/lib/stores/authStore";

interface HouseholdsTableProps {
  list: HouseholdDto[];
  loading: boolean;
  pagination: { page: number; pages: number } | null;
}

function SortableHeader({
  title,
  column,
  currentSort,
  onToggle
}: {
  title: string;
  column: string;
  currentSort: string | null;
  onToggle: (col: string) => void;
}) {
  const isActive = currentSort === column;
  return (
    <TableHead
      className="cursor-pointer hover:bg-muted/50 transition-colors group select-none"
      onClick={() => onToggle(column)}
    >
      <div className="flex items-center gap-1">
        {title}
        <ArrowUpDown className={`h-3 w-3 ${isActive ? 'text-primary' : 'text-muted-foreground opacity-0 group-hover:opacity-100'}`} />
      </div>
    </TableHead>
  );
}

export function HouseholdsTable({ list, loading, pagination }: HouseholdsTableProps) {
  const tDict = useTranslations("domain");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);

  const isAdmin = user?.role === "ADMIN";

  const updatePage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  const toggleSort = (column: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const currentSort = params.get("sort");
    const currentOrder = params.get("order");
    if (currentSort === column) {
      if (currentOrder === "asc") {
        params.set("order", "desc");
      } else {
        params.delete("sort");
        params.delete("order");
      }
    } else {
      params.set("sort", column);
      params.set("order", "asc");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const currentSort = searchParams.get("sort");

  const currentPage = pagination?.page || 1;
  const totalPages = pagination?.pages || 1;

  if (loading) {
    return (
      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>رقم القيد</TableHead>
              <TableHead>الأسرة</TableHead>
              <TableHead>العنوان</TableHead>
              <TableHead>الهاتف</TableHead>
              <TableHead>إجمالي الدخل</TableHead>
              <TableHead>التقييم</TableHead>
              <TableHead>التصنيف</TableHead>
              <TableHead>أكشن</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 8 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-8 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-8 w-24" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (list.length === 0) {
    return (
      <Empty className="border border-border/50 bg-card py-16 rounded-xl">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchX className="h-8 w-8 text-muted-foreground" />
          </EmptyMedia>
          <EmptyTitle>لا توجد بيانات</EmptyTitle>
          <EmptyDescription>
            لم يتم العثور على أسر مطابقة للبحث أو الفلاتر المحددة.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <SortableHeader title="رقم القيد" column="code" currentSort={currentSort} onToggle={toggleSort} />
              <TableHead className="w-[35%] whitespace-normal">الأسرة</TableHead>
              <SortableHeader title="العنوان" column="district" currentSort={currentSort} onToggle={toggleSort} />
              <TableHead>الهاتف</TableHead>
              <TableHead className="text-center">إجمالي الدخل</TableHead>
              <TableHead className="w-[15%] text-center">التقييم</TableHead>
              <SortableHeader title="التصنيف" column="eligibility" currentSort={currentSort} onToggle={toggleSort} />
              <TableHead className="w-8 px-1 text-center"><span className="sr-only">أكشن</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((h) => {
              // Prioritize isHead, then HEAD role, then female spouse (often the primary applicant in charities), then fallback
              const head = h.persons?.find((p) => p.isHead) || 
                           h.persons?.find((p) => p.role === "HEAD") || 
                           h.persons?.find((p) => p.gender === "FEMALE" && p.role === "SPOUSE") || 
                           h.persons?.[0];
              
              // Safe access for custom properties
              const anyHead = head as any;
              const anyH = h as any;

              const headId = anyHead?.nationalId || "—";
              const phones = Array.isArray(anyH.phones) ? anyH.phones : [];
              const primaryPhone = h.primaryPhone || phones[0];

              const totalIncome = (h.incomeSources || []).reduce((sum, s) => sum + Number(s.monthlyAmount || 0), 0);

              const score = h.scoreResults?.[0];
              const percent = score ? Number(score.normalizedPercent) : 0;
              const rec = score?.systemRecommendation as keyof typeof ELIGIBILITY_TAILWIND | undefined;

              return (
                <TableRow key={h.id} className="hover:bg-muted/30 transition-colors group">
                  <TableCell className="font-medium text-xs text-muted-foreground whitespace-nowrap">
                    {h.code}
                  </TableCell>
                  <TableCell className="whitespace-normal">
                    <div className="flex flex-col gap-1">
                      {head ? (
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-bold text-sm text-foreground leading-snug">{anyH.familyName || head.name}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">{headId}</p>
                          </div>
                          <div className="flex items-center gap-1.5 ms-auto">
                            <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center justify-center min-w-[28px] ${head.gender === 'FEMALE' ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'}`}>
                              {head.birthDate ? new Date().getFullYear() - new Date(head.birthDate).getFullYear() : "—"}
                            </div>
                            <Link href={`/dashboard/households/${h.id}/view`} className="text-muted-foreground hover:text-primary transition-colors flex items-center justify-center p-1 rounded-md hover:bg-primary/10" title="ملف الأسرة">
                              <FileText className="h-4 w-4" />
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">غير محدد</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm whitespace-normal">
                    <p className="font-medium text-foreground">{h.district || h.village || "—"}</p>
                    {h.address && <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{h.address}</p>}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1.5">
                      {primaryPhone ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-medium text-foreground">{primaryPhone}</span>
                          <a
                            href={`https://web.whatsapp.com/send/?phone=+2${primaryPhone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-green-600 dark:hover:text-green-500 transition-colors"
                            dir="ltr"
                            title="واتساب"
                          >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                            </svg>
                          </a>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-semibold tabular-nums text-foreground/90 text-center">
                    {totalIncome.toLocaleString()} ج
                  </TableCell>
                  <TableCell className="text-center align-middle">
                    {score ? (
                      <div className="flex items-center gap-2 w-full max-w-[100px] mx-auto">
                        <Progress
                          value={percent}
                          className="h-1.5 flex-1"
                          indicatorColor={rec ? ELIGIBILITY_COLORS[rec] : undefined}
                        />
                        <span className="text-[10px] font-bold w-7 text-right" dir="ltr">{percent}%</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {rec ? (
                      <Badge className={ELIGIBILITY_TAILWIND[rec]} variant="outline">
                        {tDict(`eligibility.${rec}`)}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-100">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/households/${h.id}/view`} className="flex items-center gap-2 cursor-pointer">
                            <Eye className="h-4 w-4 text-sky-600" /> عرض
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/households/${h.id}/wizard`} className="flex items-center gap-2 cursor-pointer">
                            <Edit className="h-4 w-4 text-emerald-500" /> تعديل
                          </Link>
                        </DropdownMenuItem>
                        {isAdmin && (
                          <DropdownMenuItem className="flex items-center gap-2 cursor-pointer text-rose-500 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-900/30">
                            <Trash2 className="h-4 w-4" /> حذف
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination className="justify-center pt-2">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => updatePage(Math.max(1, currentPage - 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            <div className="text-sm text-muted-foreground px-4">
              صفحة {currentPage} من {totalPages}
            </div>
            <PaginationItem>
              <PaginationNext
                onClick={() => updatePage(Math.min(totalPages, currentPage + 1))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
