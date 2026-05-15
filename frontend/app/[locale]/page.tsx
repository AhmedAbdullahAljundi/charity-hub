"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

export default function HomePage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("common.states");

  useEffect(() => {
    router.replace("/dashboard");
  }, [router, locale]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center animate-pulse">
          <span className="text-primary-foreground font-bold text-xl">C</span>
        </div>
        <p className="text-muted-foreground text-sm">{t("loading")}</p>
      </div>
    </div>
  );
}
