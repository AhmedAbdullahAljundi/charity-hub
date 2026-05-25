"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useAdminStore } from "@/lib/stores/adminStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminRulesPage() {
  const t = useTranslations("nav");
  const { rules, loading, fetchRules } = useAdminStore();

  useEffect(() => {
    void fetchRules();
  }, [fetchRules]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("ruleEditor")}</h1>
      {loading ? (
        <Loader2 className="h-8 w-8 animate-spin" />
      ) : (
        <div className="grid gap-3">
          {rules.map((r) => (
            <Card key={r.id}>
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  {r.id}
                  {r.overridden && <Badge variant="secondary">Override</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground pb-3">
                Effective: {r.effectiveValue}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
