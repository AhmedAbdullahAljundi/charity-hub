"use client";

import { useState } from "react";
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

const users = [
  { id: 1, name: "مدير النظام", email: "admin@charityhub.org", role: "مدير عام", status: "نشط", lastLogin: "2024/03/15 - 10:30" },
  { id: 2, name: "عمرو حسام الدين", email: "amr@charityhub.org", role: "متطوع - أبحاث ميدانية", status: "نشط", lastLogin: "2024/03/14 - 16:45" },
  { id: 3, name: "نورا محمد سعيد", email: "nora@charityhub.org", role: "متطوع - إدخال بيانات", status: "نشط", lastLogin: "2024/03/14 - 14:20" },
  { id: 4, name: "خالد عبدالعزيز", email: "khaled@charityhub.org", role: "متطوع - صرف علاج", status: "نشط", lastLogin: "2024/03/13 - 15:30" },
  { id: 5, name: "هند أحمد فتحي", email: "hend@charityhub.org", role: "متطوع - متابعة تعليمية", status: "غير نشط", lastLogin: "2024/02/28 - 09:15" },
  { id: 6, name: "سمية عادل حسن", email: "somaya@charityhub.org", role: "مشاهد فقط", status: "نشط", lastLogin: "2024/03/15 - 08:00" },
];

const roleColors = {
  "مدير عام": "bg-primary/10 text-primary border-primary/20",
  "متطوع - أبحاث ميدانية": "bg-purple-50 text-purple-600 border-purple-200",
  "متطوع - إدخال بيانات": "bg-blue-50 text-blue-600 border-blue-200",
  "متطوع - صرف علاج": "bg-cyan-50 text-cyan-600 border-cyan-200",
  "متطوع - متابعة تعليمية": "bg-orange-50 text-orange-600 border-orange-200",
  "مشاهد فقط": "bg-gray-50 text-gray-500 border-gray-200",
};

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const filtered = users.filter(
    (u) => u.name.includes(search) || u.email.includes(search) || u.role.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">المستخدمين والصلاحيات</h2>
          <p className="text-muted-foreground text-sm mt-1">إدارة حسابات المستخدمين وصلاحياتهم</p>
        </div>
        <Button className="gap-2" onClick={() => import("sonner").then(m => m.toast("ميزة تسجيل مستخدم قيد التطوير"))}>
          <Plus className="h-4 w-4" />
          تسجيل مستخدم
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">إجمالي المستخدمين</p>
              <p className="text-xl font-bold text-foreground">{users.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-green-100">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">نشطون</p>
              <p className="text-xl font-bold text-foreground">{users.filter((u) => u.status === "نشط").length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gray-100">
              <UserX className="h-5 w-5 text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">غير نشطين</p>
              <p className="text-xl font-bold text-foreground">{users.filter((u) => u.status === "غير نشط").length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث بالاسم أو البريد أو الصلاحية..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-right">المستخدم</TableHead>
                <TableHead className="text-right">الصلاحية</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">آخر دخول</TableHead>
                <TableHead className="text-right">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => (
                <TableRow key={user.id} className="hover:bg-accent/50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                          {user.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground text-sm">{user.name}</p>
                        <p className="text-xs text-muted-foreground" dir="ltr">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={roleColors[user.role]}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        user.status === "نشط"
                          ? "bg-green-50 text-green-600 border-green-200"
                          : "bg-gray-50 text-gray-500 border-gray-200"
                      }
                    >
                      {user.status}
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
                          <span className="sr-only">خيارات</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>تعديل البيانات</DropdownMenuItem>
                        <DropdownMenuItem>تغيير الصلاحيات</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">تعطيل الحساب</DropdownMenuItem>
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
