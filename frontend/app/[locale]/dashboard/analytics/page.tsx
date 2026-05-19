"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export default function AnalyticsPage() {
  const t = useTranslations("nav");
  const [data, setData] = useState<{
    distribution?: unknown[];
    regional?: unknown[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const [d, r] = await Promise.all([
          api.get("/analytics/distribution"),
          api.get("/analytics/regional"),
        ]);
        setData({ distribution: d.data.data, regional: r.data.data });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("analytics")}</h1>
      {loading ? (
        <Loader2 className="h-8 w-8 animate-spin" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs overflow-auto max-h-64">
                {JSON.stringify(data?.distribution, null, 2)}
              </pre>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Regional</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs overflow-auto max-h-64">
                {JSON.stringify(data?.regional, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
