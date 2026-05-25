import { useTranslations } from "next-intl";
import { AuditClient } from "@/components/dashboard/audit-client";

export default function AuditLogsPage() {
  const t = useTranslations("audit");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {t("subtitle")}
        </p>
      </div>
      
      <AuditClient />
    </div>
  );
}
