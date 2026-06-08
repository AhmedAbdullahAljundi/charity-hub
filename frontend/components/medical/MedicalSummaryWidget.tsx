import { useState, useEffect } from "react";
import { medicalApi } from "../../lib/api/medical-api";
import type { MedicalSummary } from "../../types/medical";
import { Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";

export function MedicalSummaryWidget({ householdId }: { householdId: string }) {
  const [summary, setSummary] = useState<MedicalSummary | null>(null);

  useEffect(() => {
    if (!householdId) return;
    medicalApi.getMedicalSummary(householdId)
      .then(setSummary)
      .catch(() => {});
  }, [householdId]);

  if (!summary) return <div className="animate-pulse h-24 bg-slate-100 dark:bg-slate-800 rounded-xl" />;

  return (
    <section className="bg-card text-card-foreground border rounded-xl shadow-sm overflow-hidden mt-6">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-teal-50/30 dark:bg-teal-950/20">
        <h3 className="text-base font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
          <Stethoscope className="w-5 h-5 text-teal-600 dark:text-teal-500" /> الملخص الطبي
        </h3>
      </div>
      <div className="p-4">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-lg p-3">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">إجمالي المنصرف (علاجياً)</p>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{summary.amounts?.total || 0} <span className="text-sm font-normal text-muted-foreground">ج.م</span></p>
          </div>
          <div className="bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-lg p-3">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">حالات صرف تحت المراجعة</p>
            <p className={cn("text-lg font-bold", summary.hasUnverifiedDisbursements ? "text-amber-600 dark:text-amber-500" : "text-emerald-600 dark:text-emerald-500")}>
              {summary.hasUnverifiedDisbursements ? 'يوجد فواتير معلقة' : 'لا يوجد متأخرات'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
