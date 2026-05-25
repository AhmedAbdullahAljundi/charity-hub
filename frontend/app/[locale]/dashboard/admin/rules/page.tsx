"use client";

import { useTranslations } from "next-intl";
import { AdminRulesClient } from "@/components/dashboard/admin-rules-client";
import { useAuthStore } from "@/lib/stores/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminRulesPage() {
  const t = useTranslations("ruleEditor");
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user?.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [user, isAuthenticated, router]);

  if (!isAuthenticated || user?.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {t("subtitle")}
        </p>
      </div>
      
      <AdminRulesClient />
    </div>
  );
}
