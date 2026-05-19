"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import {
  Users,
  AlertTriangle,
  Clock,
  MapPin,
  Plus,
  Search,
  Filter,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api/client";
import { useHouseholdStore } from "@/lib/stores/householdStore";
import { HouseholdsTable } from "@/components/dashboard/households-table";

function HouseholdsContent() {
  const t = useTranslations("nav");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { list, loading, pagination, fetchList } = useHouseholdStore();

  const [stats, setStats] = useState({
    totalHouseholds: 0,
    critical: 0,
    pendingDecision: 0,
    fieldVisitRequired: 0,
  });

  const currentSearch = searchParams.get("search") || "";
  const currentEligibility = searchParams.get("eligibility") || "";
  const currentDecision = searchParams.get("humanDecision") || "";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const currentSort = searchParams.get("sort") || "";
  const currentOrder = searchParams.get("order") || "";

  const [searchValue, setSearchValue] = useState(currentSearch);

  useEffect(() => {
    // Fetch stats for KPIs
    api.get("/analytics/distribution")
      .then((res) => {
        const d = res.data?.data || {};
        const byLevel = Array.isArray(d.byLevel) ? d.byLevel : [];
        const criticalCount = byLevel.find((x: any) => x.level === "CRITICAL")?.count || 0;
        setStats({
          totalHouseholds: d.totalHouseholds || 0,
          critical: criticalCount,
          pendingDecision: d.pendingDecision || 0,
          fieldVisitRequired: d.fieldVisitRequired || 0,
        });
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    // Fetch list for Table
    fetchList({
      page: currentPage,
      limit: 8,
      search: currentSearch || undefined,
      eligibility: currentEligibility || undefined,
      humanDecision: currentDecision || undefined,
      sortBy: currentSort || undefined,
      sortOrder: currentOrder || undefined,
    });
  }, [fetchList, currentPage, currentSearch, currentEligibility, currentDecision, currentSort, currentOrder]);

  const updateFilters = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`);
  }, [searchParams, pathname, router]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters("search", searchValue);
  };

  const clearFilters = () => {
    setSearchValue("");
    router.replace(pathname);
  };

  const hasFilters = !!(currentSearch || currentEligibility || currentDecision);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{t("households")}</h1>
        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href="/dashboard/households/new">
            <Plus className="h-4 w-4 me-2" />
            إضافة أسرة جديدة
          </Link>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/50 shadow-sm border-s-4 border-s-blue-500">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-xl dark:bg-blue-950/50">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">إجمالي الأسر المسجلة</p>
              <h3 className="text-2xl font-bold">{stats.totalHouseholds.toLocaleString()}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm border-s-4 border-s-rose-600">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-rose-100 p-3 rounded-xl dark:bg-rose-950/50">
              <AlertTriangle className="h-6 w-6 text-rose-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">الحالات الحرجة</p>
              <h3 className="text-2xl font-bold text-rose-600">{stats.critical.toLocaleString()}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm border-s-4 border-s-amber-500">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-amber-100 p-3 rounded-xl dark:bg-amber-950/50">
              <Clock className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">بانتظار قرار</p>
              <h3 className="text-2xl font-bold text-amber-500">{stats.pendingDecision.toLocaleString()}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm border-s-4 border-s-orange-500">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-orange-100 p-3 rounded-xl dark:bg-orange-950/50">
              <MapPin className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">تحتاج زيارة ميدانية</p>
              <h3 className="text-2xl font-bold text-orange-500">{stats.fieldVisitRequired.toLocaleString()}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="bg-card border border-border/50 rounded-xl p-4 shadow-sm flex flex-col lg:flex-row gap-4 items-end">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="ابحث بالاسم، الرقم القومي، رقم الهاتف، أو رقم القيد..."
            className="pr-9 w-full bg-background"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <Select value={currentEligibility} onValueChange={(val) => updateFilters("eligibility", val === "all" ? "" : val)}>
            <SelectTrigger className="w-full sm:w-[180px] bg-background">
              <SelectValue placeholder="الطبقة (الاستحقاق)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل (الطبقات)</SelectItem>
              <SelectItem value="CRITICAL">حرج للغاية (Critical)</SelectItem>
              <SelectItem value="HIGH_NEED">احتياج عالٍ (High)</SelectItem>
              <SelectItem value="MODERATE_NEED">احتياج متوسط (Moderate)</SelectItem>
              <SelectItem value="LOW_NEED">احتياج منخفض (Low)</SelectItem>
              <SelectItem value="NOT_ELIGIBLE">غير مستحق (Not Eligible)</SelectItem>
            </SelectContent>
          </Select>

          <Select value={currentDecision} onValueChange={(val) => updateFilters("humanDecision", val === "all" ? "" : val)}>
            <SelectTrigger className="w-full sm:w-[180px] bg-background">
              <SelectValue placeholder="حالة القرار" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل (حالة القرار)</SelectItem>
              <SelectItem value="PENDING">قيد المراجعة</SelectItem>
              <SelectItem value="APPROVED">موافق عليه</SelectItem>
              <SelectItem value="REJECTED">مرفوض</SelectItem>
              <SelectItem value="NEEDS_REVIEW">بحاجة لمراجعة</SelectItem>
              <SelectItem value="ESCALATED">مصعد</SelectItem>
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground hover:text-destructive shrink-0">
              <X className="h-4 w-4 me-1" />
              مسح
            </Button>
          )}
        </div>
      </div>

      <HouseholdsTable list={list} loading={loading} pagination={pagination} />
    </div>
  );
}

export default function HouseholdsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">جاري التحميل...</div>}>
      <HouseholdsContent />
    </Suspense>
  );
}
