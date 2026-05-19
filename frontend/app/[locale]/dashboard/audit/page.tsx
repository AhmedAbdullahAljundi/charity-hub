import { useTranslations } from "next-intl";
import { AuditClient } from "@/components/dashboard/audit-client";

export default function AuditLogsPage() {
  const t = useTranslations("nav");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">سجل النظام والتدقيق</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          متابعة التغييرات والإجراءات التي تمت على مستوى النظام بالكامل.
        </p>
      </div>
      
      <AuditClient />
    </div>
  );
}
