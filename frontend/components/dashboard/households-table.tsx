"use client";

import React, { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { Eye, Edit, Trash2, Phone, SearchX, ArrowUpDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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
              <TableHead>الأفراد المعالون</TableHead>
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
                <TableCell><Skeleton className="h-4 w-12" /></TableCell>
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
              <TableHead className="min-w-[200px]">الأسرة</TableHead>
              <SortableHeader title="العنوان" column="district" currentSort={currentSort} onToggle={toggleSort} />
              <TableHead>الهاتف</TableHead>
              <TableHead className="text-center">الأفراد المعالون</TableHead>
              <TableHead>إجمالي الدخل</TableHead>
              <TableHead className="min-w-[150px]">التقييم</TableHead>
              <SortableHeader title="التصنيف" column="eligibility" currentSort={currentSort} onToggle={toggleSort} />
              <TableHead className="text-right">أكشن</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((h) => {
              const head = h.persons?.find((p) => p.role === "HEAD" || p.isHead);
              const spouse = h.persons?.find((p) => p.role === "SPOUSE");
              
              // Safe access for custom properties
              const anyHead = head as any;
              const anySpouse = spouse as any;
              const anyH = h as any;

              const headId = anyHead?.nationalId || "—";
              const spouseId = anySpouse?.nationalId || "—";
              const phones = Array.isArray(anyH.phones) ? anyH.phones : [];

              const dependentsCount = (h.persons || []).filter(
                (p) => p.role !== "HEAD" && p.role !== "SPOUSE" && p.isSonContributor !== true && p.maritalStatus !== "MARRIED"
              ).length;

              const totalIncome = (h.incomeSources || []).reduce((sum, s) => sum + Number(s.monthlyAmount || 0), 0);
              
              const score = h.scoreResults?.[0];
              const percent = score ? Number(score.normalizedPercent) : 0;
              const rec = score?.systemRecommendation as keyof typeof ELIGIBILITY_TAILWIND | undefined;

              return (
                <TableRow key={h.id} className="hover:bg-muted/30 transition-colors group">
                  <TableCell className="font-medium text-xs text-muted-foreground whitespace-nowrap">
                    {h.code}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {head && (
                        <div>
                          <p className="font-bold text-sm leading-none">{head.name}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{headId}</p>
                        </div>
                      )}
                      {spouse && (
                        <div className="mt-1.5 border-t border-border/40 pt-1.5">
                          <p className="font-medium text-xs text-foreground/80 leading-none">{spouse.name}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{spouseId}</p>
                        </div>
                      )}
                      {!head && !spouse && <span className="text-muted-foreground text-sm">غير محدد</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    <p className="font-medium">{h.district || h.village || "—"}</p>
                    {h.address && <p className="text-[11px] text-muted-foreground truncate max-w-[150px] mt-0.5">{h.address}</p>}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1.5">
                      {phones.length > 0 ? (
                        phones.slice(0, 2).map((phone: string, idx: number) => (
                          <a
                            key={idx}
                            href={`https://api.whatsapp.com/send?phone=+2${phone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-green-600 transition-colors"
                            dir="ltr"
                          >
                            <Phone className="h-3 w-3" />
                            <span>{phone}</span>
                          </a>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="bg-muted/60">{dependentsCount}</Badge>
                  </TableCell>
                  <TableCell className="text-sm font-semibold tabular-nums text-foreground/90">
                    {totalIncome.toLocaleString()} ج
                  </TableCell>
                  <TableCell>
                    {score ? (
                      <div className="flex items-center gap-2 w-full max-w-[120px]">
                        <Progress 
                          value={percent} 
                          className="h-1.5 flex-1"
                          indicatorColor={rec ? ELIGIBILITY_COLORS[rec] : undefined}
                        />
                        <span className="text-[10px] font-bold w-7 text-right" dir="ltr">{percent}%</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">لا يوجد تقييم</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {rec ? (
                      <Badge className={ELIGIBILITY_TAILWIND[rec]} variant="outline">
                        {tDict(`eligibility.${rec}`)}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-0.5 opacity-40 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-blue-600 hover:bg-blue-50" title="عرض">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button asChild variant="ghost" size="icon" className="h-7 w-7 hover:text-primary hover:bg-primary/10" title="تعديل">
                        <Link href={`/dashboard/households/${h.id}/wizard`}>
                          <Edit className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      {isAdmin && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive hover:bg-destructive/10" title="حذف">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
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
