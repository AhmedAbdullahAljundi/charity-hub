"use client";

import { useState, useEffect, useCallback } from "react";
import { medicalApi } from "../../../lib/api/medical-api";
import { toast } from "sonner";
import {
  CheckCircle,
  XCircle,
  Clock,
  Banknote,
  AlertTriangle,
  RefreshCw,
  Eye,
  ChevronDown,
  ChevronUp,
  CreditCard,
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  PENDING:  { label: "قيد الانتظار", color: "text-amber-700 dark:text-amber-400",  bg: "bg-amber-50 dark:bg-amber-950/30",   border: "border-amber-200 dark:border-amber-800/50", icon: Clock },
  APPROVED: { label: "موافق عليه",  color: "text-blue-700 dark:text-blue-400",    bg: "bg-blue-50 dark:bg-blue-950/30",     border: "border-blue-200 dark:border-blue-800/50",   icon: CheckCircle },
  PAID:     { label: "تم الصرف",    color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800/50", icon: Banknote },
  REJECTED: { label: "مرفوض",       color: "text-rose-700 dark:text-rose-400",     bg: "bg-rose-50 dark:bg-rose-950/30",     border: "border-rose-200 dark:border-rose-800/50",   icon: XCircle },
};

const AID_TYPE_LABELS: Record<string, string> = {
  CONSULTATION: "كشف طبي",
  LAB_TEST: "تحاليل مخبرية",
  IMAGING: "أشعة",
  TREATMENT: "علاج",
  MEDICATION: "دواء",
  SURGERY: "عملية جراحية",
  FINANCIAL_AID: "إعانة مادية",
  MARRIAGE_AID: "إعانة زواج",
};

interface DisbursementsReviewTabProps {
  userRole?: string;
}

export function DisbursementsReviewTab({ userRole }: DisbursementsReviewTabProps) {
  const [disbursements, setDisbursements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("PENDING");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const canApprove = userRole === "SUPERVISOR" || userRole === "ADMIN";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await medicalApi.listDisbursements({ limit: 50 });
      setDisbursements(result.disbursements);
    } catch {
      toast.error("فشل تحميل الإعانات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id: string) => {
    setActionLoading(id + "-approve");
    try {
      await medicalApi.approveDisbursement(id);
      toast.success("تمت الموافقة على الإعانة وإرسالها للصرف");
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "فشلت الموافقة");
    } finally {
      setActionLoading(null);
    }
  };

  const handlePay = async (id: string) => {
    setActionLoading(id + "-pay");
    try {
      await medicalApi.payDisbursement(id);
      toast.success("تم تسجيل الصرف بنجاح");
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "فشل تسجيل الصرف");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id + "-reject");
    try {
      await medicalApi.rejectDisbursement(id);
      toast.success("تم رفض الإعانة");
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "فشل الرفض");
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = disbursements.filter(d => !filterStatus || d.status === filterStatus);

  const statusCounts = disbursements.reduce((acc, d) => {
    acc[d.status] = (acc[d.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Filter Bar */}
      <div className="flex flex-wrap gap-2 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm w-fit">
        {(["", "PENDING", "APPROVED", "PAID", "REJECTED"] as const).map((s) => {
          const cfg = s ? STATUS_CONFIG[s] : null;
          const count = s ? (statusCounts[s] || 0) : disbursements.length;
          return (
            <button
              key={s || "all"}
              onClick={() => setFilterStatus(s)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filterStatus === s
                  ? "bg-emerald-600 text-white shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {s ? cfg?.label : "الكل"}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${filterStatus === s ? "bg-white/20" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
                {count}
              </span>
            </button>
          );
        })}
        <button
          onClick={load}
          disabled={loading}
          className="mr-auto px-3 py-2 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Empty state — global disbursements endpoint needed */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-2xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center mb-6 border border-amber-100 dark:border-amber-900/50">
            <CreditCard className="w-10 h-10 text-amber-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-2">لا توجد إعانات للعرض</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
            {filterStatus === "PENDING"
              ? "لا توجد إعانات طبية تنتظر الموافقة حالياً. يمكن مراجعة الإعانات بعد تسجيلها من موظفي الخدمة."
              : "لا توجد إعانات بهذه الحالة في السجل. جرب تغيير التصفية."}
          </p>
          <p className="text-xs text-slate-400 mt-3 italic">
            ملاحظة: يتطلب هذا التبويب تفعيل نقطة نهاية (API) لعرض الإعانات العامة من الباك إند.
          </p>
        </div>
      )}

      {/* Disbursement Cards */}
      <div className="space-y-3">
        {filtered.map((d) => {
          const cfg = STATUS_CONFIG[d.status] || STATUS_CONFIG.PENDING;
          const StatusIcon = cfg.icon;
          const isExpanded = expandedId === d.id;

          return (
            <div key={d.id} className={`rounded-2xl border ${cfg.border} ${cfg.bg} overflow-hidden transition-all`}>
              <div className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cfg.bg} border ${cfg.border}`}>
                      <StatusIcon className={`w-5 h-5 ${cfg.color}`} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100">
                        {AID_TYPE_LABELS[d.aidType] || d.aidType}
                        {d.isRetroactive && (
                          <span className="mr-2 text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                            أثر رجعي
                          </span>
                        )}
                        {d.isCriticalOverride && (
                          <span className="mr-1 text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
                            حرجة
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {d.personName} · {new Date(d.disbursementDate).toLocaleDateString("ar-EG")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{Number(d.amount).toLocaleString("ar-EG")} ج.م</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                        {cfg.label}
                      </span>
                    </div>

                    <button
                      onClick={() => setExpandedId(isExpanded ? null : d.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-900/50 transition-all"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-black/5 dark:border-white/5 px-4 pb-4 pt-3 space-y-3 animate-in slide-in-from-top-2 duration-200">
                  {d.notes && (
                    <div className="p-3 bg-white/60 dark:bg-slate-900/60 rounded-xl border border-black/5 dark:border-white/5">
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">الملاحظات</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line">{d.notes}</p>
                    </div>
                  )}

                  {d.totalCost && (
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-slate-500 dark:text-slate-400">التكلفة الإجمالية للعملية:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{Number(d.totalCost).toLocaleString("ar-EG")} ج.م</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {canApprove && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-black/5 dark:border-white/5">
                      {d.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => handleApprove(d.id)}
                            disabled={actionLoading === d.id + "-approve"}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm disabled:opacity-60"
                          >
                            {actionLoading === d.id + "-approve" ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <CheckCircle className="w-3.5 h-3.5" />
                            )}
                            موافقة وإرسال للصرف
                          </button>
                          <button
                            onClick={() => handleReject(d.id)}
                            disabled={actionLoading === d.id + "-reject"}
                            className="flex items-center gap-2 px-4 py-2 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 text-sm font-bold rounded-xl transition-all disabled:opacity-60"
                          >
                            {actionLoading === d.id + "-reject" ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5" />
                            )}
                            رفض
                          </button>
                        </>
                      )}
                      {d.status === "APPROVED" && (
                        <button
                          onClick={() => handlePay(d.id)}
                          disabled={actionLoading === d.id + "-pay"}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm disabled:opacity-60"
                        >
                          {actionLoading === d.id + "-pay" ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Banknote className="w-3.5 h-3.5" />
                          )}
                          تأكيد الصرف (PAID)
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
