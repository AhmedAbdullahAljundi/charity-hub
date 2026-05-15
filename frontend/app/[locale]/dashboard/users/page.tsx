"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Shield,
  Plus,
  Search,
  MoreHorizontal,
  UserCheck,
  UserX,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type RoleKey =
  | "super_admin"
  | "volunteer_field"
  | "volunteer_data"
  | "volunteer_medical"
  | "volunteer_edu"
  | "viewer";

type StatusKey = "active" | "inactive";

const roleBadgeClass: Record<RoleKey, string> = {
  super_admin: "bg-primary/10 text-primary border-primary/20",
  volunteer_field: "bg-chart-2/12 text-chart-2 border-chart-2/25",
  volunteer_data: "bg-chart-4/12 text-chart-4 border-chart-4/25",
  volunteer_medical: "bg-chart-1/12 text-chart-1 border-chart-1/25",
  volunteer_edu: "bg-warning/12 text-warning-foreground border-warning/25",
  viewer: "bg-muted text-muted-foreground border-border",
};

const DEMO_USERS: Array<{
  id: number;
  nameKey: "u1_name" | "u2_name" | "u3_name" | "u4_name" | "u5_name" | "u6_name";
  email: string;
  role: RoleKey;
  status: StatusKey;
  lastLogin: string;
}> = [
  { id: 1, nameKey: "u1_name", email: "admin@charityhub.org", role: "super_admin", status: "active", lastLogin: "2024/03/15 - 10:30" },
  { id: 2, nameKey: "u2_name", email: "amr@charityhub.org", role: "volunteer_field", status: "active", lastLogin: "2024/03/14 - 16:45" },
  { id: 3, nameKey: "u3_name", email: "nora@charityhub.org", role: "volunteer_data", status: "active", lastLogin: "2024/03/14 - 14:20" },
  { id: 4, nameKey: "u4_name", email: "khaled@charityhub.org", role: "volunteer_medical", status: "active", lastLogin: "2024/03/13 - 15:30" },
  { id: 5, nameKey: "u5_name", email: "hend@charityhub.org", role: "volunteer_edu", status: "inactive", lastLogin: "2024/02/28 - 09:15" },
  { id: 6, nameKey: "u6_name", email: "somaya@charityhub.org", role: "viewer", status: "active", lastLogin: "2024/03/15 - 08:00" },
];

export default function UsersPage() {
  const t = useTranslations("users");
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    return DEMO_USERS.map((u) => ({
      ...u,
      displayName: t(`demo.${u.nameKey}` as "demo.u1_name"),
      roleLabel: t(`roles.${u.role}` as "roles.super_admin"),
      statusLabel: t(`status.${u.status}` as "status.active"),
    }));
  }, [t]);

  const filtered = rows.filter(
    (u) =>
      u.displayName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.roleLabel.toLowerCase().includes(search.toLowerCase())
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
          {t("registerUser")}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("stats.total")}</p>
              <p className="text-xl font-bold text-foreground">{DEMO_USERS.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-success/15">
              <UserCheck className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("stats.active")}</p>
              <p className="text-xl font-bold text-foreground">
                {DEMO_USERS.filter((u) => u.status === "active").length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-muted/80">
              <UserX className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("stats.inactive")}</p>
              <p className="text-xl font-bold text-foreground">
                {DEMO_USERS.filter((u) => u.status === "inactive").length}
              </p>
            </div>
          </CardContent>
        </Card>
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

      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table dir="auto">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-start">{t("table.user")}</TableHead>
                <TableHead className="text-start">{t("table.role")}</TableHead>
                <TableHead className="text-start">{t("table.status")}</TableHead>
                <TableHead className="text-start">{t("table.lastLogin")}</TableHead>
                <TableHead className="text-start w-16">{t("table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => (
                <TableRow key={user.id} className="hover:bg-accent/50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                          {user.displayName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground text-sm">{user.displayName}</p>
                        <p className="text-xs text-muted-foreground" dir="ltr">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={roleBadgeClass[user.role]}>
                      {user.roleLabel}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        user.status === "active"
                          ? "bg-success/12 text-success border-success/25"
                          : "bg-muted text-muted-foreground border-border"
                      }
                    >
                      {user.statusLabel}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm" dir="ltr">
                    {user.lastLogin}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">{t("menu.open")}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>{t("menu.edit")}</DropdownMenuItem>
                        <DropdownMenuItem>{t("menu.changeRole")}</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">{t("menu.disable")}</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
