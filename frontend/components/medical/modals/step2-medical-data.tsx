"use client";

import { useEffect, useMemo } from "react";
import { useMedicalModalStore } from "../../../lib/stores/medicalModalStore";

const DISEASE_WEIGHTS = {
  TREATMENT: { NONE: 0.0, PERIODIC_CHEAP: 0.2, PERIODIC_EXPENSIVE: 0.4, VERY_EXPENSIVE: 0.6 },
  FOLLOWUP: { NONE_OR_RARE: 0.0, REGULAR: 0.3, EXPENSIVE: 0.5 },
  WORK_IMPACT: { NONE: 0.0, MINOR: 0.2, MAJOR_WORKS: 0.4, CANNOT_WORK: 0.6 },
} as const;

const MAX_SCORE = 1.7;

const CircularProgress = ({ percentage, color }: { percentage: number; color: string }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-24 h-24 shrink-0">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="48"
          cy="48"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          className="text-slate-100 dark:text-slate-800"
        />
        <circle
          cx="48"
          cy="48"
          r={radius}
          stroke={color}
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-slate-800 dark:text-slate-100">{Math.round(percentage)}%</span>
      </div>
    </div>
  );
};

export function Step2MedicalData() {
  const {
    selectedPerson,
    selectedHousehold,
    medicalCondition,
    setMedicalCondition,
    medicalNotes,
    setMedicalNotes,
    treatmentCost,
    setTreatmentCost,
    followup,
    setFollowup,
    workImpact,
    setWorkImpact,
    setSeverity,
    nextStep,
    prevStep,
  } = useMedicalModalStore();

  const handleNextStep = () => {
    if (selectedPerson && medicalCondition) {
      nextStep();
    }
  };

  // Calculate score based on weights
  const score = useMemo(() => {
    const tScore = DISEASE_WEIGHTS.TREATMENT[treatmentCost as keyof typeof DISEASE_WEIGHTS.TREATMENT] || 0;
    const fScore = DISEASE_WEIGHTS.FOLLOWUP[followup as keyof typeof DISEASE_WEIGHTS.FOLLOWUP] || 0;
    const wScore = DISEASE_WEIGHTS.WORK_IMPACT[workImpact as keyof typeof DISEASE_WEIGHTS.WORK_IMPACT] || 0;
    return tScore + fScore + wScore;
  }, [treatmentCost, followup, workImpact]);

  const percentage = Math.min(100, Math.max(0, (score / MAX_SCORE) * 100));
  const isCritical = percentage >= 50;

  useEffect(() => {
    setSeverity(isCritical ? "severe" : "mild");
  }, [isCritical, setSeverity]);

  const progressColor =
    percentage < 30 ? "#3b82f6" : percentage < 50 ? "#f59e0b" : percentage < 80 ? "#ef4444" : "#9f1239";
  const severityText = isCritical ? "حالة حرجة (أولوية واستثناء)" : "حالة عادية";
  const severityColor = isCritical ? "text-red-600 bg-red-50 border-red-200" : "text-blue-600 bg-blue-50 border-blue-200";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-slate-800/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-full border border-slate-100 dark:border-slate-800">
          <CircularProgress percentage={percentage} color={progressColor} />
        </div>
        <div className="flex-1 text-center md:text-right">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">تقييم شدة المرض</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
            يتم حساب التقييم بشكل آلي بناءً على التكلفة والتأثير والمتابعة لتحديد ما إذا كانت الحالة تستوجب الأولوية والاستثناءات.
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 mt-4">
            <div className={`inline-flex items-center px-4 py-1.5 rounded-full border text-sm font-bold shadow-sm ${
              isCritical 
                ? "text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-900/30 dark:border-rose-800/50 dark:text-rose-400" 
                : "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800/50 dark:text-emerald-400"
            }`}>
              {severityText}
            </div>

            {selectedHousehold?.scoreResults?.[0]?.normalizedPercent !== undefined && (
              <div className="inline-flex items-center px-4 py-1.5 rounded-full border text-sm font-bold shadow-sm bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800/50">
                تقييم الأسرة الكلي: {Number(selectedHousehold.scoreResults[0].normalizedPercent).toFixed(1)}%
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
        <div>
          <label className="block text-sm font-bold mb-2 text-slate-800 dark:text-slate-200">التشخيص أو الحالة الطبية <span className="text-rose-500">*</span></label>
          <input
            type="text"
            value={medicalCondition}
            onChange={(e) => setMedicalCondition(e.target.value)}
            placeholder="مثال: السكري، ارتفاع ضغط الدم، فشل كلوي..."
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 dark:focus:ring-emerald-500/30 text-slate-800 dark:text-slate-100 transition-all placeholder:text-slate-400"
          />
        </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <label className="block text-sm font-bold mb-2 text-slate-800 dark:text-slate-200">تكلفة العلاج الشهري</label>
          <select
            value={treatmentCost}
            onChange={(e) => setTreatmentCost(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 dark:focus:ring-emerald-500/30 text-slate-800 dark:text-slate-100 transition-all"
          >
            <option value="NONE">لا يوجد / مجاني</option>
            <option value="PERIODIC_CHEAP">تكلفة بسيطة دورية</option>
            <option value="PERIODIC_EXPENSIVE">مكلف دورياً</option>
            <option value="VERY_EXPENSIVE">مكلف جداً / مستمر</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold mb-2 text-slate-800 dark:text-slate-200">المتابعة الطبية</label>
          <select
            value={followup}
            onChange={(e) => setFollowup(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 dark:focus:ring-emerald-500/30 text-slate-800 dark:text-slate-100 transition-all"
          >
            <option value="NONE_OR_RARE">نادرة أو لا يوجد</option>
            <option value="REGULAR">متابعة دورية منتظمة</option>
            <option value="EXPENSIVE">متابعة مكلفة ومكثفة</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold mb-2 text-slate-800 dark:text-slate-200">تأثيره على العمل</label>
          <select
            value={workImpact}
            onChange={(e) => setWorkImpact(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 dark:focus:ring-emerald-500/30 text-slate-800 dark:text-slate-100 transition-all"
          >
            <option value="NONE">لا تأثير مباشر</option>
            <option value="MINOR">تأثير طفيف (محدود)</option>
            <option value="MAJOR_WORKS">تأثير كبير (لكن يعمل)</option>
            <option value="CANNOT_WORK">يعيقه عن العمل تماماً</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold mb-2 text-slate-800 dark:text-slate-200">ملاحظات إضافية (اختياري)</label>
        <textarea
          value={medicalNotes}
          onChange={(e) => setMedicalNotes(e.target.value)}
          placeholder="أي معلومات إضافية عن الحالة الطبية..."
          rows={3}
          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 dark:focus:ring-emerald-500/30 text-slate-800 dark:text-slate-100 transition-all resize-none placeholder:text-slate-400"
        />
      </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          onClick={prevStep}
          className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-3.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          رجوع للأسرة
        </button>
        <button
          onClick={handleNextStep}
          disabled={!medicalCondition}
          className="flex-[2] bg-gradient-to-l from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-300 disabled:to-slate-300 dark:disabled:from-slate-800 dark:disabled:to-slate-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-md disabled:shadow-none disabled:text-slate-500 dark:disabled:text-slate-600 disabled:cursor-not-allowed"
        >
          متابعة لتحديد الإجراء الطبي
        </button>
      </div>
    </div>
  );
}
