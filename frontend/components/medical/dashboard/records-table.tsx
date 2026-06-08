"use client";

import { useState, useEffect, useCallback } from "react";
import { medicalApi } from "../../../lib/api/medical-api";
import { useMedicalStore } from "../../../lib/stores/medicalStore";
import { RefreshCw, ChevronRight, ChevronLeft, Banknote, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

const AID_TYPE_LABELS: Record<string, string> = {
  CONSULTATION: "كشف طبي",
  LAB_TEST: "تحاليل",
  IMAGING: "أشعة",
  TREATMENT: "علاج",
  MEDICATION: "دواء",
  SURGERY: "عملية جراحية",
  FINANCIAL_AID: "إعانة مادية",
  MARRIAGE_AID: "إعانة زواج",
};

const STATUS_BADGE: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  PENDING:  { label: "قيد الانتظار", cls: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",  icon: Clock },
  APPROVED: { label: "موافق عليه",   cls: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",    icon: CheckCircle },
  PAID:     { label: "تم الصرف",     cls: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400", icon: Banknote },
  REJECTED: { label: "مرفوض",        cls: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400",     icon: XCircle },
};

interface DisbursementRow {
  id: string;
  personName: string;
  householdCode: string;
  aidType: string;
  amount: number;
  status: string;
  disbursementDate: string;
  isCriticalOverride: boolean;
  isRetroactive: boolean;
  conditionName?: string;
}

interface MedicalRecordsTableProps {
  records?: any[];
}

export function MedicalRecordsTable({ records }: MedicalRecordsTableProps) {
  const { currentPage, totalPages, loadCases } = useMedicalStore();
  const [disbursements, setDisbursements] = useState<DisbursementRow[]>([]);
  const [disbTotal, setDisbTotal] = useState(0);
  const [disbPage, setDisbPage] = useState(1);
  const [disbTotalPages, setDisbTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const loadDisbursements = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const result = await medicalApi.listDisbursements({ page, limit: 15 });
      setDisbursements(result.disbursements.map((d: any) => ({
        id: d.id,
        personName: d.personName || "—",
        householdCode: d.householdCode || "—",
        aidType: d.aidType,
        amount: d.amount,
        status: d.status,
        disbursementDate: d.disbursementDate,
        isCriticalOverride: d.isCriticalOverride,
        isRetroactive: d.isRetroactive,
        conditionName: d.medicalCaseName,
      })));
      setDisbTotal(result.total);
      setDisbTotalPages(result.totalPages || 1);
      setDisbPage(page);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDisbursements(1); }, []);

  const goPage = (p: number) => loadDisbursements(p);

  if (loading && disbursements.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
        <RefreshCw className="w-5 h-5 animate-spin" />
        <span>جاري تحميل الإعانات...</span>
      </div>
    );
  }

  if (disbursements.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mb-4">
          <Banknote className="w-8 h-8 text-slate-300 dark:text-slate-600" />
        </div>
        <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-1">لا توجد إعانات مسجّلة</h3>
        <p className="text-sm text-slate-400">اضغط على «إضافة سجل طبي جديد» لتسجيل أول إعانة.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-teal-500/10 dark:border-teal-500/20 bg-teal-500/5 dark:bg-teal-500/10 text-[12px] font-semibold uppercase tracking-wider text-teal-800 dark:text-teal-400">
              <th className="px-4 py-3 text-right whitespace-nowrap">الشخص / الأسرة</th>
              <th className="px-4 py-3 text-right whitespace-nowrap">الإجراء الطبي</th>
              <th className="px-4 py-3 text-right whitespace-nowrap">المبلغ</th>
              <th className="px-4 py-3 text-right whitespace-nowrap">الحالة</th>
              <th className="px-4 py-3 text-right whitespace-nowrap">التاريخ</th>
              <th className="px-4 py-3 text-right whitespace-nowrap">ملاحظات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {disbursements.map((d) => {
              const statusCfg = STATUS_BADGE[d.status] || STATUS_BADGE.PENDING;
              const StatusIcon = statusCfg.icon;
              return (
                <tr key={d.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-800 dark:text-slate-100">{d.personName}</p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">{d.householdCode}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {AID_TYPE_LABELS[d.aidType] || d.aidType}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                      {Number(d.amount).toLocaleString("ar-EG")} ج.م
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusCfg.cls}`}>
                      <StatusIcon className="w-3 h-3 shrink-0" />
                      {statusCfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap text-xs">
                    {d.disbursementDate ? new Date(d.disbursementDate).toLocaleDateString("ar-EG") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {d.isCriticalOverride && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                          <AlertTriangle className="w-2.5 h-2.5" /> حرجة
                        </span>
                      )}
                      {d.isRetroactive && (
                        <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                          أثر رجعي
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          إجمالي {disbTotal} إعانة · صفحة {disbPage} من {disbTotalPages}
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => goPage(disbPage - 1)}
            disabled={disbPage <= 1 || loading}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-600 dark:text-slate-400"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          {Array.from({ length: Math.min(disbTotalPages, 7) }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => goPage(p)}
              disabled={loading}
              className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                disbPage === p
                  ? "bg-teal-600 text-white"
                  : "hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => goPage(disbPage + 1)}
            disabled={disbPage >= disbTotalPages || loading}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-600 dark:text-slate-400"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => loadDisbursements(disbPage)}
            disabled={loading}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 transition-colors mr-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
