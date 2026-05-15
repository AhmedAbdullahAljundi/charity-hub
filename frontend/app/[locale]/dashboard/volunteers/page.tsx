"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Plus,
  Search,
  MapPin,
  Phone,
  Star,
  Calendar,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatLocaleNumber } from "@/lib/format/locale-format";
import type { AppLocale } from "@/lib/i18n/locales";

type SpecialtyKey = "field" | "data" | "medical" | "education";
type StatusKey = "active" | "inactive";

const ROWS: Array<{
  id: number;
  nameRef: { ns: "users" | "volunteers"; key: string };
  phone: string;
  areaKey: string;
  tasks: number;
  rating: number;
  status: StatusKey;
  specialty: SpecialtyKey;
}> = [
  { id: 1, nameRef: { ns: "users", key: "demo.u2_name" }, phone: "01001234567", areaKey: "v1_area", tasks: 24, rating: 4.8, status: "active", specialty: "field" },
  { id: 2, nameRef: { ns: "users", key: "demo.u3_name" }, phone: "01112345678", areaKey: "v2_area", tasks: 18, rating: 4.5, status: "active", specialty: "data" },
  { id: 3, nameRef: { ns: "users", key: "demo.u4_name" }, phone: "01223456789", areaKey: "v3_area", tasks: 31, rating: 4.9, status: "active", specialty: "medical" },
  { id: 4, nameRef: { ns: "users", key: "demo.u5_name" }, phone: "01554567890", areaKey: "v4_area", tasks: 12, rating: 4.2, status: "inactive", specialty: "education" },
  { id: 5, nameRef: { ns: "volunteers", key: "demo.v5_name" }, phone: "01005678901", areaKey: "v5_area", tasks: 28, rating: 4.7, status: "active", specialty: "field" },
  { id: 6, nameRef: { ns: "users", key: "demo.u6_name" }, phone: "01116789012", areaKey: "v6_area", tasks: 15, rating: 4.4, status: "active", specialty: "data" },
];

export default function VolunteersPage() {
  const t = useTranslations("volunteers");
  const tu = useTranslations("users");
  const locale = useLocale() as AppLocale;
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    return ROWS.map((r) => {
      const name =
        r.nameRef.ns === "users"
          ? tu(r.nameRef.key as "demo.u2_name")
          : t(r.nameRef.key as "demo.v5_name");
      const area = t(`demo.${r.areaKey}` as "demo.v1_area");
      const specialty = t(`specialty.${r.specialty}` as "specialty.field");
      const statusLabel = t(`status.${r.status}` as "status.active");
      return { ...r, name, area, specialty, statusLabel };
    });
  }, [t, tu]);

  const filtered = rows.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.area.toLowerCase().includes(search.toLowerCase()) ||
      v.phone.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{t("title")}</h2>
          <p className="text-muted-foreground text-sm mt-1">{t("subtitle")}</p>
        </div>
        <Button
          className="gap-2"
          onClick={() => import("sonner").then((m) => m.toast(t("toastComingSoon")))}
        >
          <Plus className="h-4 w-4" />
          {t("addVolunteer")}
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute inset-e-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((vol) => (
          <Card key={vol.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start gap-3 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">{vol.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{vol.name}</h3>
                  <p className="text-xs text-muted-foreground">{vol.specialty}</p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    vol.status === "active"
                      ? "bg-success/12 text-success border-success/25"
                      : "bg-muted text-muted-foreground border-border"
                  }
                >
                  {vol.statusLabel}
                </Badge>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  <span dir="ltr">{vol.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span>{vol.area}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{t("tasksCount", { count: vol.tasks })}</span>
                  </div>
                  <div className="flex items-center gap-1 text-warning-foreground">
                    <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                    <span className="font-medium tabular-nums">
                      {formatLocaleNumber(locale, vol.rating, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
