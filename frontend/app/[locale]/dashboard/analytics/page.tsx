import { useTranslations } from "next-intl";
import { AnalyticsClient } from "@/components/dashboard/analytics-client";

export default function AnalyticsPage() {
  const t = useTranslations("analytics");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {t("subtitle")}
        </p>
      </div>
      
      <AnalyticsClient />
    </div>
  );
}
