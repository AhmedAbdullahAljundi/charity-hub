"use client";

import {
  History,
  User,
  Calendar,
  FileText,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const auditLogs = [
  { id: 1, user: "مدير النظام", action: "إضافة أسرة جديدة", target: "عائلة أحمد محمد", timestamp: "2024/03/15 - 10:30", type: "إضافة" },
  { id: 2, user: "مدير النظام", action: "تعديل بيانات أسرة", target: "عائلة فاطمة السيد", timestamp: "2024/03/15 - 09:15", type: "تعديل" },
  { id: 3, user: "عمرو حسام", action: "إكمال بحث ميداني", target: "عائلة محمود علي", timestamp: "2024/03/14 - 16:45", type: "بحث" },
  { id: 4, user: "نورا محمد", action: "إدخال بيانات دخل", target: "عائلة زينب عبدالرحمن", timestamp: "2024/03/14 - 14:20", type: "إضافة" },
  { id: 5, user: "مدير النظام", action: "تصدير تقرير الأسر", target: "تقرير شامل", timestamp: "2024/03/14 - 11:00", type: "تقرير" },
  { id: 6, user: "خالد عبدالعزيز", action: "صرف علاج", target: "فاطمة علي - عائلة أحمد", timestamp: "2024/03/13 - 15:30", type: "صرف" },
  { id: 7, user: "مدير النظام", action: "تعديل صلاحيات مستخدم", target: "نورا محمد سعيد", timestamp: "2024/03/13 - 10:00", type: "تعديل" },
  { id: 8, user: "هند أحمد", action: "تحديث متابعة تعليمية", target: "محمد أحمد - الصف الأول الثانوي", timestamp: "2024/03/12 - 13:45", type: "تحديث" },
];

const typeColors = {
  "إضافة": "bg-green-50 text-green-600 border-green-200",
  "تعديل": "bg-blue-50 text-blue-600 border-blue-200",
  "بحث": "bg-purple-50 text-purple-600 border-purple-200",
  "تقرير": "bg-orange-50 text-orange-600 border-orange-200",
  "صرف": "bg-cyan-50 text-cyan-600 border-cyan-200",
  "تحديث": "bg-yellow-50 text-yellow-600 border-yellow-200",
};

export default function AuditPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">سجل التعديلات</h2>
        <p className="text-muted-foreground text-sm mt-1">متابعة جميع العمليات والتعديلات على النظام</p>
      </div>

      <div className="space-y-3">
        {auditLogs.map((log) => (
          <Card key={log.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                    {log.user[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="font-semibold text-foreground text-sm">{log.user}</span>
                    <span className="text-muted-foreground text-sm">{log.action}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-foreground/80 truncate">{log.target}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <Badge variant="outline" className={typeColors[log.type]}>{log.type}</Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span dir="ltr">{log.timestamp}</span>
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
