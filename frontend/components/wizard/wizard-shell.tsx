"use client";

import { useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { useWizardStore } from "@/lib/stores/wizardStore";
import { useScoringStore } from "@/lib/stores/scoringStore";
import { WizardStepContent } from "./wizard-steps";
import { StickyScorePanel } from "./sticky-score-panel";
import { AutosaveIndicator } from "./autosave-indicator";
import { cn } from "@/lib/utils";

const TABS = [
  { id: 1 as const, label: "البيانات الأساسية" },
  { id: 2 as const, label: "الأفراد" },
  { id: 3 as const, label: "الدخل" },
  { id: 4 as const, label: "الأحمال" },
  { id: 5 as const, label: "التقييم" },
];

export function WizardShell({ 
  householdId: initialId,
  mode = "edit"
}: { 
  householdId?: string;
  mode?: "edit" | "view";
}) {
  const activeTab = useWizardStore((s) => s.activeTab);
  const isDirty = useWizardStore((s) => s.isDirty);
  const autoSave = useWizardStore((s) => s.autoSave);
  const setHouseholdId = useWizardStore((s) => s.setHouseholdId);
  const setActiveTab = useWizardStore((s) => s.setActiveTab);
  const fetchLatest = useScoringStore((s) => s.fetchLatest);

  useEffect(() => {
    if (initialId) {
      setHouseholdId(initialId);
      fetchLatest(initialId);
    }
  }, [initialId, setHouseholdId, fetchLatest]);

  useEffect(() => {
    if (mode === "view") return;
    const id = setInterval(() => {
      void autoSave();
    }, 10000);
    return () => clearInterval(id);
  }, [autoSave, mode]);

  useEffect(() => {
    if (mode === "view") return;
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty, mode]);

  const onNext = useCallback(async () => {
    if (mode === "edit") {
      await autoSave();
    }
    if (activeTab < 5) setActiveTab((activeTab + 1) as 1|2|3|4|5);
  }, [autoSave, activeTab, setActiveTab, mode]);

  const onPrev = useCallback(() => {
    if (activeTab > 1) setActiveTab((activeTab - 1) as 1|2|3|4|5);
  }, [activeTab, setActiveTab]);

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start" dir="rtl">
      <div className="flex-1 min-w-0 space-y-4">
        {mode === "view" && (
          <Alert className="bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/50 dark:border-blue-900 dark:text-blue-200">
            <Info className="h-4 w-4" />
            <AlertTitle>وضع الاستعراض</AlertTitle>
            <AlertDescription>
              أنت تقوم بعرض هذه الأسرة في وضع القراءة فقط. التعديلات غير متاحة ولن يتم حفظ أي تغييرات.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-xl font-bold">
            {mode === "edit" ? "إضافة / تعديل بيانات الأسرة" : "بيانات الأسرة"}
          </h1>
          {mode === "edit" && <AutosaveIndicator />}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all select-none border",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card text-muted-foreground border-border hover:bg-muted"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <Card className="border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/20 border-b border-border/40 pb-4">
            <CardTitle className="text-lg">
              {TABS.find(t => t.id === activeTab)?.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 relative">
            <WizardStepContent step={activeTab} />
            {mode === "view" && (
              <div className="absolute inset-0 z-50 bg-transparent cursor-not-allowed" title="وضع الاستعراض" />
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between gap-2 pt-2">
          <Button type="button" variant="outline" disabled={activeTab <= 1} onClick={onPrev}>
            السابق
          </Button>
          <Button type="button" disabled={activeTab >= 5} onClick={onNext}>
            التالي
          </Button>
        </div>
      </div>

      <div className="w-full shrink-0 lg:w-80 lg:sticky lg:top-20">
        <StickyScorePanel />
      </div>
    </div>
  );
}
