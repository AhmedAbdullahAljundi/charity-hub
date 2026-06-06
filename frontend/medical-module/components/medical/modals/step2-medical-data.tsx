"use client";

import { useMedicalModalStore } from "@/lib/medical/store";
import { calculateEligibility } from "@/lib/medical/utils";

export function Step2MedicalData() {
  const {
    selectedPerson,
    selectedHousehold,
    medicalCondition,
    setMedicalCondition,
    severity,
    setSeverity,
    medicalNotes,
    setMedicalNotes,
    setCalculatedEligibility,
    nextStep,
    prevStep,
  } = useMedicalModalStore();

  const handleNextStep = () => {
    if (selectedPerson && medicalCondition && severity) {
      // Calculate eligibility and move to next step
      const eligibility = calculateEligibility(selectedPerson, selectedHousehold!);
      setCalculatedEligibility(eligibility);
      nextStep();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold mb-2">الحالة الطبية</label>
        <input
          type="text"
          value={medicalCondition}
          onChange={(e) => setMedicalCondition(e.target.value)}
          placeholder="مثال: السكري، ارتفاع ضغط الدم"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-right"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">درجة الشدة</label>
        <div className="grid grid-cols-3 gap-3">
          {(["mild", "moderate", "severe"] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverity(sev)}
              className={`p-3 rounded-lg border-2 font-medium text-center transition-all ${
                severity === sev
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              {sev === "mild" ? "خفيفة" : sev === "moderate" ? "متوسطة" : "شديدة"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">ملاحظات إضافية</label>
        <textarea
          value={medicalNotes}
          onChange={(e) => setMedicalNotes(e.target.value)}
          placeholder="أي معلومات إضافية ذات صلة..."
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-right resize-none"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={prevStep}
          className="flex-1 bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg hover:bg-gray-400 transition-colors"
        >
          السابق
        </button>
        <button
          onClick={handleNextStep}
          disabled={!medicalCondition || !severity}
          className="flex-1 bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-300 transition-colors"
        >
          التالي
        </button>
      </div>
    </div>
  );
}
