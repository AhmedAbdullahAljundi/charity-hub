"use client";

import { useMedicalModalStore } from "../../../lib/stores/medicalModalStore";
import { formatCurrency } from "@/lib/medical/utils";
import { AidTypeGrid } from "../shared/aid-type-grid";
import { EligibilityPanel } from "../shared/eligibility-panel";

import { useState, useEffect } from "react";
import { medicalApi } from "../../../lib/api/medical-api";
import { toast } from "sonner";

export function Step3AidSelection() {
  const {
    selectedPerson,
    selectedHousehold,
    medicalCondition,
    severity,
    medicalNotes,
    aidType,
    setAidType,
    amount,
    setAmount,
    aidNotes,
    setAidNotes,
    totalCost,
    setTotalCost,
    isRetroactive,
    setIsRetroactive,
    prevStep,
    closeModal,
  } = useMedicalModalStore();

  const [eligibility, setEligibility] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showWarningConfirm, setShowWarningConfirm] = useState(false);
  const [overrideReason, setOverrideReason] = useState("");

  useEffect(() => {
    if (selectedHousehold) {
      medicalApi.getMedicalSummary(selectedHousehold.id).then(setSummary).catch(() => {});
    }
  }, [selectedHousehold?.id]);

  useEffect(() => {
    if (!selectedHousehold || !aidType) return;
    medicalApi.checkEligibility(selectedHousehold.id, aidType, selectedPerson?.id)
      .then(setEligibility)
      .catch(() => {});
  }, [selectedHousehold?.id, aidType, selectedPerson?.id]);

  const handleInitialSubmit = () => {
    const hasAmountWarning = eligibility?.appliedCap && amount > eligibility.appliedCap;
    const hasEligibilityWarning = eligibility?.warningLevel === 'WARNING';
    
    if ((hasAmountWarning || hasEligibilityWarning) && !showWarningConfirm) {
      setShowWarningConfirm(true);
      return;
    }
    executeSubmit();
  };

  const executeSubmit = async () => {
    try {
      setSubmitting(true);
      
      let caseId: string | undefined;
      if (medicalCondition) {
        const newCase = await medicalApi.createCase({
          householdId: selectedHousehold!.id,
          personId: selectedPerson!.id,
          conditionName: medicalCondition,
          isCritical: severity === 'severe',
          isActive: true,
          notes: medicalNotes,
        });
        caseId = newCase.id;
      }

      const result = await medicalApi.createDisbursement({
        householdId: selectedHousehold!.id,
        personId: selectedPerson!.id,
        medicalCaseId: caseId,
        aidType: aidType!,
        amount,
        totalCost: aidType === 'SURGERY' ? totalCost : undefined,
        isRetroactive,
        disbursementDate: new Date().toISOString(),
        notes: aidNotes + (overrideReason ? `\n\nسبب الاستثناء: ${overrideReason}` : ''),
      });

      if (result.amountWarning) {
        toast.warning(result.amountWarning);
      } else {
        toast.success('تم حفظ السجل الطبي بنجاح');
      }

      closeModal();
      
      // Refresh the table and KPIs
      import("../../../lib/stores/medicalStore").then(module => {
        module.useMedicalStore.getState().loadCases();
        module.useMedicalStore.getState().loadKpis();
      });
      
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'حدث خطأ أثناء الحفظ';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!selectedPerson || !selectedHousehold) {
    return <div>خطأ: لم يتم اختيار شخص أو أسرة</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <EligibilityPanel
        eligibilityLevel={!aidType ? 'pending_aid_selection' : (eligibility?.warningLevel || 'pending')}
        personName={selectedPerson.name}
        personAge={selectedPerson.age}
        lastDisbursementDate={summary?.lastDisbursementDate}
        householdScore={selectedHousehold.scoreResults?.[0]?.normalizedPercent}
      />

      <div className="bg-white dark:bg-slate-800/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-bold mb-2 text-slate-800 dark:text-slate-100">الإجراء الطبي المطلوب <span className="text-rose-500">*</span></label>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">هذا الإجراء خاضع لمراجعة واعتماد اللجنة الطبية بناءً على الأهلية الموضحة أعلاه.</p>
          <AidTypeGrid selectedAidType={aidType} onSelect={setAidType} />
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
          <label className="block text-sm font-bold mb-2 text-slate-800 dark:text-slate-100">المبلغ المطلوب من المؤسسة (ج.م) <span className="text-rose-500">*</span></label>
          <div className="relative">
            <input
              type="number"
              value={amount || ""}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="أدخل المبلغ المقدر..."
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 dark:focus:ring-emerald-500/30 text-slate-800 dark:text-slate-100 transition-all text-right font-mono text-lg"
            />
            {amount > 0 && (
              <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 rounded-xl text-right text-sm text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-between">
                <span>المبلغ المطلوب:</span>
                <span className="text-lg">{formatCurrency(amount)}</span>
              </div>
            )}
          </div>
        </div>

        {aidType === 'SURGERY' && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
            <label className="block text-sm font-bold mb-2 text-slate-800 dark:text-slate-100">التكلفة الكلية للعملية الجراحية (ج.م) <span className="text-rose-500">*</span></label>
            <input
              type="number"
              value={totalCost || ""}
              onChange={(e) => setTotalCost(Number(e.target.value))}
              placeholder="التكلفة الإجمالية المطلوبة للعملية..."
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 dark:focus:ring-emerald-500/30 text-slate-800 dark:text-slate-100 transition-all text-right font-mono text-lg"
            />
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
          <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <input
              type="checkbox"
              checked={isRetroactive}
              onChange={(e) => setIsRetroactive(e.target.checked)}
              className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-900"
            />
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">تسجيل مساعدة بأثر رجعي</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                تفعيل هذا الخيار يعني أن المساعدة صُرفت بالفعل في الماضي وسيتم تسجيلها للأرشفة فقط دون انتظار موافقة المشرف للتنفيذ.
              </p>
            </div>
          </label>
        </div>

        <div className="pt-4">
          <label className="block text-sm font-bold mb-2 text-slate-800 dark:text-slate-100">ملاحظات إضافية</label>
          <textarea
            value={aidNotes}
            onChange={(e) => setAidNotes(e.target.value)}
            placeholder="أي ملاحظات حول المساعدة أو توصيات..."
            rows={3}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 dark:focus:ring-emerald-500/30 text-slate-800 dark:text-slate-100 transition-all resize-none placeholder:text-slate-400"
          />
        </div>
      </div>

      {showWarningConfirm && (
        <div className="p-5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl animate-in fade-in slide-in-from-bottom-2">
          <h4 className="font-bold text-amber-800 dark:text-amber-500 mb-2 flex items-center gap-2">
            ⚠️ تنبيه: تجاوز قواعد الصرف
          </h4>
          <p className="text-sm text-amber-700 dark:text-amber-400/80 mb-4">
            هذا السجل يتجاوز السقف المالي أو فترة الانتظار (Cooldown). لحفظ هذا السجل كاستثناء (سيتم تعليقه لحين موافقة المشرف)، يرجى كتابة سبب الاستثناء:
          </p>
          <textarea
            value={overrideReason}
            onChange={(e) => setOverrideReason(e.target.value)}
            placeholder="سبب الاستثناء للصرف (مثال: حالة طارئة بأمر المدير)..."
            rows={2}
            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-slate-800 dark:text-slate-100 transition-all resize-none placeholder:text-amber-700/50"
          />
        </div>
      )}

      <div className="flex gap-4 pt-4">
        <button
          onClick={prevStep}
          className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-3.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          رجوع
        </button>
        <button
          onClick={handleInitialSubmit}
          disabled={!aidType || amount <= 0 || submitting || (showWarningConfirm && !overrideReason.trim())}
          className="flex-[2] bg-gradient-to-l from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-300 disabled:to-slate-300 dark:disabled:from-slate-800 dark:disabled:to-slate-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-md disabled:shadow-none disabled:text-slate-500 dark:disabled:text-slate-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              جاري الإرسال...
            </>
          ) : (
            'حفظ وإرسال للجنة'
          )}
        </button>
      </div>
    </div>
  );
}
