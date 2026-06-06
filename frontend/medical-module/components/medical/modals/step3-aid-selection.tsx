"use client";

import { useMedicalModalStore } from "@/lib/medical/store";
import { formatCurrency } from "@/lib/medical/utils";
import { AidTypeGrid } from "../shared/aid-type-grid";
import { EligibilityPanel } from "../shared/eligibility-panel";

export function Step3AidSelection() {
  const {
    selectedPerson,
    selectedHousehold,
    aidType,
    setAidType,
    amount,
    setAmount,
    aidNotes,
    setAidNotes,
    calculatedEligibility,
    prevStep,
    closeModal,
  } = useMedicalModalStore();

  const handleSubmit = () => {
    if (selectedPerson && aidType && amount > 0) {
      // TODO: Submit form data to API
      console.log("[v0] Form submitted:", {
        household: selectedHousehold?.name,
        person: selectedPerson.name,
        aidType,
        amount,
        eligibility: calculatedEligibility,
      });
      closeModal();
    }
  };

  if (!selectedPerson || !selectedHousehold) {
    return <div>خطأ: لم يتم اختيار شخص أو أسرة</div>;
  }

  return (
    <div className="space-y-6">
      <EligibilityPanel
        eligibilityLevel={calculatedEligibility}
        personName={selectedPerson.name}
        personAge={selectedPerson.age}
      />

      <div>
        <label className="block text-sm font-semibold mb-3">نوع المساعدة</label>
        <AidTypeGrid selectedAidType={aidType} onSelect={setAidType} />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">المبلغ (ريال سعودي)</label>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-right"
          />
          {amount > 0 && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-right text-sm text-blue-800">
              المبلغ الإجمالي: {formatCurrency(amount)}
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">ملاحظات إضافية</label>
        <textarea
          value={aidNotes}
          onChange={(e) => setAidNotes(e.target.value)}
          placeholder="أي ملاحظات على المساعدة..."
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
          onClick={handleSubmit}
          disabled={!aidType || amount <= 0}
          className="flex-1 bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-300 transition-colors"
        >
          إرسال
        </button>
      </div>
    </div>
  );
}
