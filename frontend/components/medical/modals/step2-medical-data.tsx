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
          className="text-gray-200"
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
        <span className="text-lg font-bold text-gray-800">{Math.round(percentage)}%</span>
      </div>
    </div>
  );
};

export function Step2MedicalData() {
  const {
    selectedPerson,
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
    <div className="space-y-6">
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center gap-6">
        <CircularProgress percentage={percentage} color={progressColor} />
        <div className="flex-1 text-center md:text-right">
          <h3 className="text-lg font-bold text-slate-800 mb-1">تقييم شدة المرض</h3>
          <p className="text-sm text-slate-500 mb-3">
            يتم حساب التقييم بناءً على تكلفة العلاج وتأثير المرض على العمل ومدى الحاجة لمتابعة مستمرة.
          </p>
          <div className={`inline-flex items-center px-3 py-1 rounded-full border text-sm font-semibold ${severityColor}`}>
            {severityText}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2 text-slate-700">التشخيص أو الحالة الطبية</label>
        <input
          type="text"
          value={medicalCondition}
          onChange={(e) => setMedicalCondition(e.target.value)}
          placeholder="مثال: السكري، ارتفاع ضغط الدم، فشل كلوي..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-2 text-slate-700">تكلفة العلاج الشهري</label>
          <select
            value={treatmentCost}
            onChange={(e) => setTreatmentCost(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right"
          >
            <option value="NONE">لا يوجد / مجاني</option>
            <option value="PERIODIC_CHEAP">تكلفة بسيطة دورية</option>
            <option value="PERIODIC_EXPENSIVE">مكلف دورياً</option>
            <option value="VERY_EXPENSIVE">مكلف جداً / مستمر</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-slate-700">المتابعة الطبية</label>
          <select
            value={followup}
            onChange={(e) => setFollowup(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right"
          >
            <option value="NONE_OR_RARE">نادرة أو لا يوجد</option>
            <option value="REGULAR">متابعة دورية منتظمة</option>
            <option value="EXPENSIVE">متابعة مكلفة ومكثفة</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-slate-700">تأثيره على العمل</label>
          <select
            value={workImpact}
            onChange={(e) => setWorkImpact(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right"
          >
            <option value="NONE">لا تأثير مباشر</option>
            <option value="MINOR">تأثير طفيف (محدود)</option>
            <option value="MAJOR_WORKS">تأثير كبير (لكن يعمل)</option>
            <option value="CANNOT_WORK">يعيقه عن العمل تماماً</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2 text-slate-700">ملاحظات إضافية (اختياري)</label>
        <textarea
          value={medicalNotes}
          onChange={(e) => setMedicalNotes(e.target.value)}
          placeholder="أي معلومات إضافية عن الحالة الطبية..."
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right resize-none"
        />
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-100">
        <button
          onClick={prevStep}
          className="flex-1 bg-gray-100 text-gray-800 font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors"
        >
          رجوع للأسرة
        </button>
        <button
          onClick={handleNextStep}
          disabled={!medicalCondition}
          className="flex-[2] bg-emerald-600 text-white font-semibold py-3 rounded-xl hover:bg-emerald-700 disabled:bg-gray-300 transition-colors shadow-md"
        >
          متابعة لتحديد الإجراء الطبي
        </button>
      </div>
    </div>
  );
}
