import { useState, useEffect } from "react";
import { medicalApi } from "../../lib/api/medical-api";
import type { MedicalSummary } from "../../types/medical";

export function MedicalSummaryWidget({ householdId }: { householdId: string }) {
  const [summary, setSummary] = useState<MedicalSummary | null>(null);

  useEffect(() => {
    if (!householdId) return;
    medicalApi.getMedicalSummary(householdId)
      .then(setSummary)
      .catch(() => {});
  }, [householdId]);

  if (!summary) return <div className="animate-pulse h-40 bg-slate-100 rounded-xl" />;

  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm">
      <h3 className="font-bold text-lg mb-4 text-emerald-800">الملخص الطبي</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-slate-500">إجمالي الصرفيات</p>
          <p className="text-xl font-bold">{summary.amounts.total} ج.م</p>
        </div>
        <div>
          <p className="text-sm text-slate-500">حالات صرف تحت المراجعة</p>
          <p className="text-xl font-bold">{summary.hasUnverifiedDisbursements ? 'يوجد' : 'لا يوجد'}</p>
        </div>
      </div>
    </div>
  );
}
