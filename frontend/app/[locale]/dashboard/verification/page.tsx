import { useTranslations } from "next-intl";
import { VerificationClient } from "@/components/dashboard/verification-client";

export default function VerificationPage() {
  const t = useTranslations("nav");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("verification")}</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          مراجعة وتوثيق مصادر الدخل المسجلة للأسرة لحساب الموثوقية.
        </p>
      </div>
      
      <VerificationClient />
    </div>
  );
}
