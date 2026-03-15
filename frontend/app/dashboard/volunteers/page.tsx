"use client";

import { useState } from "react";
import {
  Heart,
  Plus,
  Search,
  MapPin,
  Phone,
  Star,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const volunteers = [
  { id: 1, name: "عمرو حسام الدين", phone: "01001234567", area: "المنصورة", tasks: 24, rating: 4.8, status: "نشط", specialty: "أبحاث ميدانية" },
  { id: 2, name: "نورا محمد سعيد", phone: "01112345678", area: "طنطا", tasks: 18, rating: 4.5, status: "نشط", specialty: "إدخال بيانات" },
  { id: 3, name: "خالد عبدالعزيز", phone: "01223456789", area: "دمنهور", tasks: 31, rating: 4.9, status: "نشط", specialty: "صرف علاج" },
  { id: 4, name: "هند أحمد فتحي", phone: "01554567890", area: "كفر الشيخ", tasks: 12, rating: 4.2, status: "غير نشط", specialty: "متابعة تعليمية" },
  { id: 5, name: "محمد إبراهيم علي", phone: "01005678901", area: "الزقازيق", tasks: 28, rating: 4.7, status: "نشط", specialty: "أبحاث ميدانية" },
  { id: 6, name: "سمية عادل حسن", phone: "01116789012", area: "بنها", tasks: 15, rating: 4.4, status: "نشط", specialty: "إدخال بيانات" },
];

export default function VolunteersPage() {
  const [search, setSearch] = useState("");
  const filtered = volunteers.filter(
    (v) => v.name.includes(search) || v.area.includes(search) || v.phone.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">المتطوعين</h2>
          <p className="text-muted-foreground text-sm mt-1">إدارة فريق المتطوعين والمهام</p>
        </div>
        <Button className="gap-2" onClick={() => import("sonner").then(m => m.toast("ميزة إضافة متطوع قيد التطوير"))}>
          <Plus className="h-4 w-4" />
          إضافة متطوع
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث بالاسم أو المنطقة أو الهاتف..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10"
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
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {vol.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{vol.name}</h3>
                  <p className="text-xs text-muted-foreground">{vol.specialty}</p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    vol.status === "نشط"
                      ? "bg-green-50 text-green-600 border-green-200"
                      : "bg-gray-50 text-gray-500 border-gray-200"
                  }
                >
                  {vol.status}
                </Badge>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  <span dir="ltr">{vol.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{vol.area}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{vol.tasks} مهمة</span>
                  </div>
                  <div className="flex items-center gap-1 text-warning-foreground">
                    <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                    <span className="font-medium">{vol.rating}</span>
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
