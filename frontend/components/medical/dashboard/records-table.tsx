"use client";

import { useState, useEffect, useCallback } from "react";
import { medicalApi } from "../../../lib/api/medical-api";
import { useAuthStore } from "@/lib/stores/authStore";
import { toast } from "sonner";
import {
  RefreshCw, ChevronRight, ChevronLeft,
  Banknote, Clock, CheckCircle, XCircle,
  AlertTriangle, ShieldAlert, History,
  MoreVertical, ThumbsUp, ThumbsDown, CreditCard,
} from "lucide-react";

// ── Labels ──────────────────────────────────────────────────────────────────
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

const STATUS_CFG: Record<string, { label: string; pill: string; icon: React.ElementType; row: string }> = {
  PENDING:  {
    label: "قيد الانتظار",
    pill: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40",
    icon: Clock,
    row:  "",
  },
  APPROVED: {
    label: "موافق عليه",
    pill: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40",
    icon: CheckCircle,
    row:  "bg-blue-50/30 dark:bg-blue-950/10",
  },
  PAID: {
    label: "تم الصرف",
    pill: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40",
    icon: Banknote,
    row:  "bg-emerald-50/30 dark:bg-emerald-950/10",
  },
  REJECTED: {
    label: "مرفوض",
    pill: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40",
    icon: XCircle,
    row:  "bg-rose-50/20 dark:bg-rose-950/10 opacity-70",
  },
};

// ── Types ───────────────────────────────────────────────────────────────────
interface DRow {
  id: string;
  personName: string;
  householdCode: string;
  aidType: string;
  amount: number;
  status: string;
  disbursementDate: string;
  isCriticalOverride: boolean;
  isRetroactive: boolean;
}

// ── Inline action menu ───────────────────────────────────────────────────────
function ActionMenu({
  row,
  canApprove,
  onRefresh,
}: {
  row: DRow;
  canApprove: boolean;
  onRefresh: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const act = async (action: "approve" | "pay" | "reject") => {
    setBusy(action);
    setOpen(false);
    try {
      if (action === "approve") {
        await medicalApi.approveDisbursement(row.id);
        toast.success("تمت الموافقة على الإعانة");
      } else if (action === "pay") {
        await medicalApi.payDisbursement(row.id);
        toast.success("تم تسجيل الصرف بنجاح");
      } else {
        await medicalApi.rejectDisbursement(row.id);
        toast.success("تم رفض الإعانة");
      }
      onRefresh();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "حدث خطأ أثناء التنفيذ");
    } finally {
      setBusy(null);
    }
  };

  // ── No actions possible ──
  const isPaid = row.status === "PAID";
  const isRejected = row.status === "REJECTED";
  const isPending = row.status === "PENDING";
  const isApproved = row.status === "APPROVED";

  if (!canApprove || isPaid || isRejected) {
    return <span className="text-slate-300 dark:text-slate-700 text-xs">—</span>;
  }

  if (busy) {
    return <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
        title="الإجراءات"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {open && (
        <>
          {/* backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          {/* menu — positioned to avoid overflow */}
          <div className="absolute left-0 top-8 z-20 min-w-[160px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 animate-in fade-in slide-in-from-top-2 duration-150">
            {isPending && (
              <>
                <button
                  onClick={() => act("approve")}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-right text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
                >
                  <ThumbsUp className="w-3.5 h-3.5 shrink-0" />
                  موافقة وإرسال للصرف
                </button>
                <button
                  onClick={() => act("reject")}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-right text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                >
                  <ThumbsDown className="w-3.5 h-3.5 shrink-0" />
                  رفض الطلب
                </button>
              </>
            )}
            {isApproved && (
              <button
                onClick={() => act("pay")}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-right text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
              >
                <CreditCard className="w-3.5 h-3.5 shrink-0" />
                تأكيد الصرف (PAID)
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ── Main Table ───────────────────────────────────────────────────────────────
export function MedicalRecordsTable() {
  const user = useAuthStore((s) => s.user);
  const canApprove = user?.role === "SUPERVISOR" || user?.role === "ADMIN";

  const [rows, setRows] = useState<DRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");

  const load = useCallback(async (p = 1, status = filterStatus) => {
    setLoading(true);
    try {
      const result = await medicalApi.listDisbursements({
        page: p,
        limit: 15,
        status: status || undefined,
      });
      setRows(
        result.disbursements.map((d: any) => ({
          id: d.id,
          personName: d.personName || "—",
          householdCode: d.householdCode || "—",
          aidType: d.aidType,
          amount: d.amount,
          status: d.status,
          disbursementDate: d.disbursementDate,
          isCriticalOverride: d.isCriticalOverride,
          isRetroactive: d.isRetroactive,
        }))
      );
      setTotal(result.total);
      setTotalPages(result.totalPages || 1);
      setPage(p);
    } catch {
      //
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => { load(1); }, []);

  const handleStatusFilter = (s: string) => {
    setFilterStatus(s);
    load(1, s);
  };

  // ── Filter chips ──
  const filterChips = [
    { label: "الكل", value: "" },
    { label: "انتظار", value: "PENDING" },
    { label: "موافق", value: "APPROVED" },
    { label: "تم الصرف", value: "PAID" },
    { label: "مرفوض", value: "REJECTED" },
  ];

  // ── States ──
  if (loading && rows.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 gap-3 text-slate-400 dark:text-slate-500">
        <RefreshCw className="w-5 h-5 animate-spin" />
        <span className="text-sm">جاري تحميل البيانات...</span>
      </div>
    );
  }

  return (
    <div dir="rtl">
      {/* Filter + Refresh bar */}
      <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          {filterChips.map((c) => (
            <button
              key={c.value}
              onClick={() => handleStatusFilter(c.value)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                filterStatus === c.value
                  ? "bg-teal-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">{total} إعانة</span>
          <button
            onClick={() => load(page)}
            disabled={loading}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {rows.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mb-4">
            <Banknote className="w-8 h-8 text-slate-300 dark:text-slate-600" />
          </div>
          <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-1">لا توجد إعانات</h3>
          <p className="text-sm text-slate-400">اضغط «إضافة سجل طبي جديد» لتسجيل أول إعانة.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm" dir="rtl">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                <th className="px-4 py-3 text-right">الشخص / الأسرة</th>
                <th className="px-4 py-3 text-right">الإجراء الطبي</th>
                <th className="px-4 py-3 text-right">درجة الخطورة</th>
                <th className="px-4 py-3 text-right">المبلغ</th>
                <th className="px-4 py-3 text-right">الحالة</th>
                <th className="px-4 py-3 text-right">التاريخ</th>
                {canApprove && <th className="px-4 py-3 text-center">إجراء</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {rows.map((d) => {
                const cfg = STATUS_CFG[d.status] || STATUS_CFG.PENDING;
                const StatusIcon = cfg.icon;
                return (
                  <tr
                    key={d.id}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${cfg.row}`}
                  >
                    {/* Person */}
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                        {d.personName}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {d.householdCode}
                      </p>
                    </td>

                    {/* Aid type */}
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                        {AID_TYPE_LABELS[d.aidType] || d.aidType}
                      </span>
                      {d.isRetroactive && (
                        <span className="mr-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40">
                          <History className="w-2.5 h-2.5" /> أثر رجعي
                        </span>
                      )}
                    </td>

                    {/* Severity */}
                    <td className="px-4 py-3.5">
                      {d.isCriticalOverride ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40 text-xs font-bold">
                          <ShieldAlert className="w-3 h-3 shrink-0" />
                          حرجة
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 text-xs font-medium">
                          عادية
                        </span>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 tabular-nums text-base">
                        {Number(d.amount).toLocaleString("ar-EG")}
                      </span>
                      <span className="text-xs text-emerald-600/70 dark:text-emerald-500/70 mr-0.5">ج.م</span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.pill}`}>
                        <StatusIcon className="w-3 h-3 shrink-0" />
                        {cfg.label}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 whitespace-nowrap text-xs">
                      {d.disbursementDate
                        ? new Date(d.disbursementDate).toLocaleDateString("ar-EG", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "—"}
                    </td>

                    {/* Actions */}
                    {canApprove && (
                      <td className="px-4 py-3.5 text-center">
                        <ActionMenu row={d} canApprove={canApprove} onRefresh={() => load(page)} />
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20" dir="rtl">
          <p className="text-xs text-slate-400">
            صفحة {page} من {totalPages} · {total} إعانة
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => load(page - 1)}
              disabled={page <= 1 || loading}
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-600 dark:text-slate-400"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => load(p)}
                disabled={loading}
                className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                  page === p
                    ? "bg-teal-600 text-white shadow-sm"
                    : "hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => load(page + 1)}
              disabled={page >= totalPages || loading}
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-600 dark:text-slate-400"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
