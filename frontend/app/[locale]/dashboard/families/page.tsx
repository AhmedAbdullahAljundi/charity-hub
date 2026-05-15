"use client";

import { useState, useMemo, useEffect } from "react";
import { Link } from "@/i18n/navigation";
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
import { useLocale, useTranslations } from "next-intl";
import { useFamiliesStore } from "@/lib/store";
import { AddFamilyForm } from "@/components/add-family-form";
import { formatLocaleNumber } from "@/lib/format/locale-format";
import type { AppLocale } from "@/lib/i18n/locales";

const classificationColors: Record<string, string> = {
  VERY_FRAGILE: "bg-destructive/15 text-destructive border-destructive/30",
  FRAGILE: "bg-destructive/10 text-destructive border-destructive/25",
  WEAK: "bg-warning/15 text-warning-foreground border-warning/30",
  MODERATE: "bg-primary/12 text-primary border-primary/25",
  OUT_OF_PRIORITY: "bg-muted text-muted-foreground border-border",
};

const PAGE_SIZE = 10;

const VULN_KEYS = ["VERY_FRAGILE", "FRAGILE", "WEAK", "MODERATE", "OUT_OF_PRIORITY"] as const;

export default function FamiliesPage() {
  const { families, filters, setFilters, deleteFamily, fetchFamilies, loading } = useFamiliesStore();
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState("asc");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFamily, setEditingFamily] = useState<Record<string, unknown> | null>(null);

  const t = useTranslations("families.list");
  const tDomain = useTranslations("domain");
  const locale = useLocale() as AppLocale;
  const collatorLocale = locale === "ar" ? "ar" : "en";

  useEffect(() => {
    fetchFamilies();
  }, []);

  const sortedFamilies = useMemo(() => {
    let result = [...families];

    if (sortField) {
      result.sort((a, b) => {
        const aVal = (a as Record<string, unknown>)[sortField];
        const bVal = (b as Record<string, unknown>)[sortField];
        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortDir === "asc" ? aVal - bVal : bVal - aVal;
        }
        return sortDir === "asc"
          ? String(aVal).localeCompare(String(bVal), collatorLocale)
          : String(bVal).localeCompare(String(aVal), collatorLocale);
      });
    }

    return result;
  }, [families, sortField, sortDir, collatorLocale]);

  const totalPages = Math.ceil(sortedFamilies.length / PAGE_SIZE);
  const paginated = sortedFamilies.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const classificationLabel = (code: string) => {
    const k = code as (typeof VULN_KEYS)[number];
    if (VULN_KEYS.includes(k)) {
      return tDomain(`vulnerability.${k}`);
    }
    return code;
  };

  const fmtMoney = (n: number) =>
    `${formatLocaleNumber(locale, n, { maximumFractionDigits: 0 })} ${t("currency")}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{t("title")}</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {t("subtitle", { count: families.length })}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {t("addFamily")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("dialogAdd")}</DialogTitle>
            </DialogHeader>
            <AddFamilyForm onSuccess={() => { setDialogOpen(false); fetchFamilies(); }} />
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={!!editingFamily} onOpenChange={(val) => !val && setEditingFamily(null)}>
        {editingFamily && (
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("dialogEdit")}</DialogTitle>
            </DialogHeader>
            <AddFamilyForm
              initialData={editingFamily}
              onSuccess={() => setEditingFamily(null)}
            />
          </DialogContent>
        )}
      </Dialog>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("searchPlaceholder")}
                value={filters.search}
                onChange={(e) => {
                  setFilters({ search: e.target.value });
                  setPage(1);
                }}
                className="ps-10"
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
                <Filter className="h-4 w-4 me-2 text-muted-foreground" />
                <SelectValue placeholder={t("filterClassification")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("classificationAll")}</SelectItem>
                {VULN_KEYS.map((k) => (
                  <SelectItem key={k} value={k}>
                    {tDomain(`vulnerability.${k}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead
                  className="cursor-pointer hover:text-foreground transition-colors text-start"
                  onClick={() => handleSort("headName")}
                >
                  {t("table.headName")}
                </TableHead>
                <TableHead className="text-start">{t("table.nationalId")}</TableHead>
                <TableHead className="text-start">{t("table.phone")}</TableHead>
                <TableHead
                  className="cursor-pointer hover:text-foreground transition-colors text-start"
                  onClick={() => handleSort("members")}
                >
                  {t("table.members")}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:text-foreground transition-colors text-start"
                  onClick={() => handleSort("totalIncome")}
                >
                  {t("table.totalIncome")}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:text-foreground transition-colors text-start"
                  onClick={() => handleSort("vulnerabilityIndex")}
                >
                  {t("table.vulnerabilityIndex")}
                </TableHead>
                <TableHead className="text-start">{t("table.classification")}</TableHead>
                <TableHead className="text-start">{t("table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-8 w-8 animate-spin" />
                      <p>{t("loading")}</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Search className="h-8 w-8" />
                      <p>{t("empty")}</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((family: Record<string, unknown> & { id: string | number }) => (
                  <TableRow key={String(family.id)} className="hover:bg-accent/50 transition-colors">
                    <TableCell className="font-medium">{String(family.headName ?? "")}</TableCell>
                    <TableCell className="font-mono text-sm" dir="ltr">
                      {String(family.nationalId ?? "")}
                    </TableCell>
                    <TableCell className="font-mono text-sm" dir="ltr">
                      {String(family.phone ?? "")}
                    </TableCell>
                    <TableCell>
                      {Array.isArray(family.members) ? family.members.length : Number(family.members ?? 0)}
                    </TableCell>
                    <TableCell>{fmtMoney(Number(family.totalIncome ?? 0))}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{
                              width: `${Math.min((Number(family.vulnerabilityIndex) || 0) * 10, 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm tabular-nums">
                          {formatLocaleNumber(locale, Math.min((Number(family.vulnerabilityIndex) || 0) * 10, 100), {
                            maximumFractionDigits: 0,
                          })}
                          {t("percent")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={classificationColors[String(family.classification)] ?? ""}
                      >
                        {classificationLabel(String(family.classification))}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <Link href={`/dashboard/families/${family.id}`}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">{t("sr.view")}</span>
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditingFamily(family)}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">{t("sr.edit")}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => {
                            if (window.confirm(t("deleteConfirm"))) {
                              deleteFamily(family.id);
                              import("sonner").then((m) => m.toast.success(t("deleteSuccess")));
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">{t("sr.delete")}</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              {t("pagination", {
                from: (page - 1) * PAGE_SIZE + 1,
                to: Math.min(page * PAGE_SIZE, sortedFamilies.length),
                total: sortedFamilies.length,
              })}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronRight className="h-4 w-4 rtl:rotate-180" />
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
                <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
