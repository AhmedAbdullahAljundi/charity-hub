import { useTranslations } from "next-intl";
import { AdminRulesClient } from "@/components/dashboard/admin-rules-client";

export default function AdminRulesPage() {
  const t = useTranslations("nav");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">إدارة قواعد التقييم</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          تعديل متغيرات النظام وأوزان التقييم (خاص بالمديرين فقط).
        </p>
      </div>
      
      <AdminRulesClient />
    </div>
  );
}
