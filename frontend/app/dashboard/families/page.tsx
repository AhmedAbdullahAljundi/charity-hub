"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Trash2,
  Filter,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useFamiliesStore } from "@/lib/store";
import { AddFamilyForm } from "@/components/add-family-form";

const classificationColors: Record<string, string> = {
  VERY_FRAGILE: "bg-red-100 text-red-700 border-red-200",
  FRAGILE: "bg-red-50 text-red-600 border-red-100",
  WEAK: "bg-orange-100 text-orange-700 border-orange-200",
  MODERATE: "bg-blue-100 text-blue-700 border-blue-200",
  OUT_OF_PRIORITY: "bg-gray-100 text-gray-600 border-gray-200",
};

const classificationLabels: Record<string, string> = {
  VERY_FRAGILE: "هش للغاية (حرج)",
  FRAGILE: "هش للغاية",
  WEAK: "ضعيف",
  MODERATE: "متوسط",
  OUT_OF_PRIORITY: "خارج الأولوية",
};

const PAGE_SIZE = 10;

export default function FamiliesPage() {
  const { families, filters, setFilters, deleteFamily, fetchFamilies, loading } = useFamiliesStore();
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFamily, setEditingFamily] = useState(null);

  useEffect(() => {
    fetchFamilies();
  }, []); // Initial fetch only

  const sortedFamilies = useMemo(() => {
    let result = [...families];

    if (sortField) {
      result.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        if (typeof aVal === "number") {
          return sortDir === "asc" ? aVal - bVal : bVal - aVal;
        }
        return sortDir === "asc"
          ? String(aVal).localeCompare(String(bVal), "ar")
          : String(bVal).localeCompare(String(aVal), "ar");
      });
    }

    return result;
  }, [families, sortField, sortDir]);

  const totalPages = Math.ceil(sortedFamilies.length / PAGE_SIZE);
  const paginated = sortedFamilies.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">الأسر</h2>
          <p className="text-muted-foreground text-sm mt-1">
            إدارة بيانات الأسر المسجلة ({families.length} أسرة)
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة أسرة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>إضافة أسرة جديدة</DialogTitle>
            </DialogHeader>
            <AddFamilyForm onSuccess={() => { setDialogOpen(false); fetchFamilies(); }} />
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={!!editingFamily} onOpenChange={(val) => !val && setEditingFamily(null)}>
        {editingFamily && (
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>تعديل بيانات الأسرة</DialogTitle>
            </DialogHeader>
            <AddFamilyForm
              initialData={editingFamily}
              onSuccess={() => setEditingFamily(null)}
            />
          </DialogContent>
        )}
      </Dialog>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث بالاسم، الرقم القومي، أو الهاتف..."
                value={filters.search}
                onChange={(e) => {
                  setFilters({ search: e.target.value });
                  setPage(1);
                }}
                className="pr-10"
              />
            </div>
            <Select
              value={filters.classification}
              onValueChange={(val) => {
                setFilters({ classification: val });
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 ml-2 text-muted-foreground" />
                <SelectValue placeholder="التصنيف" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع التصنيفات</SelectItem>
                <SelectItem value="VERY_FRAGILE">هش للغاية (حرج)</SelectItem>
                <SelectItem value="FRAGILE">هش للغاية</SelectItem>
                <SelectItem value="WEAK">ضعيف</SelectItem>
                <SelectItem value="MODERATE">متوسط</SelectItem>
                <SelectItem value="OUT_OF_PRIORITY">خارج الأولوية</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead
                  className="cursor-pointer hover:text-foreground transition-colors text-right"
                  onClick={() => handleSort("headName")}
                >
                  اسم رب الأسرة
                </TableHead>
                <TableHead className="text-right">الرقم القومي</TableHead>
                <TableHead className="text-right">الهاتف</TableHead>
                <TableHead
                  className="cursor-pointer hover:text-foreground transition-colors text-right"
                  onClick={() => handleSort("members")}
                >
                  عدد الأفراد
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:text-foreground transition-colors text-right"
                  onClick={() => handleSort("totalIncome")}
                >
                  إجمالي الدخل
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:text-foreground transition-colors text-right"
                  onClick={() => handleSort("vulnerabilityIndex")}
                >
                  مؤشر الهشاشة
                </TableHead>
                <TableHead className="text-right">التصنيف</TableHead>
                <TableHead className="text-right">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-8 w-8 animate-spin" />
                      <p>جاري تحميل البيانات...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Search className="h-8 w-8" />
                      <p>لا توجد نتائج مطابقة</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((family) => (
                  <TableRow key={family.id} className="hover:bg-accent/50 transition-colors">
                    <TableCell className="font-medium">{family.headName}</TableCell>
                    <TableCell className="font-mono text-sm" dir="ltr">{family.nationalId}</TableCell>
                    <TableCell className="font-mono text-sm" dir="ltr">{family.phone}</TableCell>
                    <TableCell>{Array.isArray(family.members) ? family.members.length : family.members}</TableCell>
                    <TableCell>{(family.totalIncome ?? 0).toLocaleString("ar-EG")} ج.م</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${Math.min((family.vulnerabilityIndex || 0) * 10, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm tabular-nums">
                          {Math.min((family.vulnerabilityIndex || 0) * 10, 100).toFixed(0)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={classificationColors[family.classification]}
                      >
                        {classificationLabels[family.classification] || family.classification}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <Link href={`/dashboard/families/${family.id}`}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">عرض</span>
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingFamily(family)}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">تعديل</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => {
                            if (window.confirm("هل أنت متأكد من حذف هذه الأسرة؟")) {
                              deleteFamily(family.id);
                              import("sonner").then(m => m.toast.success("تم حذف الأسرة بنجاح"));
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">حذف</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              عرض {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, sortedFamilies.length)} من {sortedFamilies.length}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={p === page ? "default" : "outline"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              ))}
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
