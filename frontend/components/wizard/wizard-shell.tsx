"use client";

import { useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { useWizardStore } from "@/lib/stores/wizardStore";
import { useScoringStore } from "@/lib/stores/scoringStore";
import { WizardStepContent } from "./wizard-steps";
import { StickyScorePanel } from "./sticky-score-panel";
import { AutosaveIndicator } from "./autosave-indicator";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

const TAB_IDS = [1, 2, 3, 4, 5] as const;
const TAB_KEYS = ["basic", "persons", "income", "burdens", "evaluation"] as const;

function FamilyNameHeader({ mode }: { mode: "edit" | "view" }) {
  const fd = useWizardStore((s) => s.formData);
  const t = useTranslations("households");
  
  let familyNameStr = t("wizard.newFamily");
  if (fd.familyName) {
    familyNameStr = fd.familyName;
  } else if (fd.wifeName) {
    familyNameStr = `${t("wizard.familyPrefix")} ${fd.wifeName}`;
  } else if (fd.head?.name) {
    familyNameStr = `${t("wizard.familyPrefix")} ${fd.head.name}`;
  }

  const actionText = t("wizard.title");
 
 return (
 <div className="flex flex-col md:flex-row md:items-center text-slate-800 dark:text-slate-100">
 <div className="flex items-center gap-2">
 <h1 className="text-base md:text-xl font-bold">
 {familyNameStr}
 </h1>
 {mode === "edit" && fd.code && (
 <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-xs rounded px-2 py-0.5 border border-slate-200 dark:border-slate-700">
 [{fd.code}]
 </span>
 )}
 </div>
 <span className="hidden md:inline-block mx-2 text-muted-foreground font-light">—</span>
 <span className="text-sm text-muted-foreground">
 {actionText}
 </span>
 </div>
 );
}

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
 const t = useTranslations("households");

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
    if (activeTab === 1) {
      const fd = useWizardStore.getState().formData;
      if (!fd.addressDetails || !fd.addressDetails.trim()) {
        toast.error("يرجى إدخال العنوان التفصيلي قبل الانتقال للخطوة التالية.");
        return;
      }
    }
    if (mode === "edit") {
      await autoSave();
    }
    if (activeTab < 5) setActiveTab((activeTab + 1) as 1|2|3|4|5);
 }, [autoSave, activeTab, setActiveTab, mode]);

 const handleTabChange = useCallback(async (newTab: 1 | 2 | 3 | 4 | 5) => {
    if (activeTab === 1 && newTab !== 1) {
      const fd = useWizardStore.getState().formData;
      if (!fd.addressDetails || !fd.addressDetails.trim()) {
        toast.error("يرجى إدخال العنوان التفصيلي قبل الانتقال للخطوة التالية.");
        return;
      }
    }
    if (mode === "edit") {
      await autoSave();
    }
    setActiveTab(newTab);
  }, [autoSave, activeTab, isDirty, mode, setActiveTab]);

 const onPrev = useCallback(() => {
 if (activeTab > 1) setActiveTab((activeTab - 1) as 1|2|3|4|5);
 }, [activeTab, setActiveTab]);

 return (
 <div className="flex flex-col gap-6 lg:flex-row lg:items-start" >
 <div className="flex-1 min-w-0 space-y-4">
 {mode === "view" && (
 <Alert className="bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/50 dark:border-blue-900 dark:text-blue-200">
 <Info className="h-4 w-4" />
 <AlertTitle>{t("wizard.viewMode")}</AlertTitle>
 <AlertDescription>
 {t("wizard.viewModeDesc")}
 </AlertDescription>
 </Alert>
 )}

 <div className="flex flex-wrap items-center justify-between gap-2">
 <FamilyNameHeader mode={mode} />
 {mode === "edit" && <AutosaveIndicator />}
 </div>

 <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
 {TAB_IDS.map((id, i) => (
 <button
 key={id}
 type="button"
 onClick={() => void handleTabChange(id)}
 className={cn(
 "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all select-none border",
 activeTab === id
 ? "bg-primary text-primary-foreground border-primary shadow-sm"
 : "bg-card text-muted-foreground border-border hover:bg-muted"
 )}
 >
 {t(`wizard.tabs.${TAB_KEYS[i]}`)}
 </button>
 ))}
 </div>

 <Card className="border-border/50 shadow-sm overflow-hidden">
 <CardContent className="pt-6 relative flex-1 overflow-y-auto">
 <WizardStepContent step={activeTab} />
 {mode === "view" && (
 <div className="absolute inset-0 z-50 bg-transparent cursor-not-allowed" title={t("wizard.viewMode")} />
 )}
 </CardContent>
 </Card>

 <div className="flex justify-between items-center gap-2 pt-2 mt-4">
 <div className="flex gap-2">
 <Button type="button" variant="outline" disabled={activeTab <= 1} onClick={onPrev}>
 {t("wizard.previous")}
 </Button>
 <Button type="button" disabled={activeTab >= 5} onClick={onNext}>
 {t("wizard.next")}
 </Button>
 </div>
 {mode === "edit" && (
 <div className="flex items-center gap-4">
 <span className="text-xs text-muted-foreground hidden sm:inline-block">
 {isDirty ? t("wizard.unsaved") : t("wizard.allSaved")}
 </span>
 <Button type="button" onClick={() => void autoSave()} className="bg-green-600 hover:bg-green-700 text-white">
 {t("wizard.saveBtn")}
 </Button>
 </div>
 )}
 </div>
 </div>

 {activeTab === 5 && (
 <div className="w-full shrink-0 lg:w-80 lg:sticky lg:top-20">
 <StickyScorePanel />
 </div>
 )}
 </div>
 );
}
