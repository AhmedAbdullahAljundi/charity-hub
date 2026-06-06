"use client";

import { X } from "lucide-react";
import { useMedicalModalStore } from "../../../lib/stores/medicalModalStore";
import { Step1HouseholdPerson } from "./step1-household-person";
import { Step2MedicalData } from "./step2-medical-data";
import { Step3AidSelection } from "./step3-aid-selection";

export function AddRecordModal() {
  const { isModalOpen, closeModal, currentStep } = useMedicalModalStore();

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <button
            onClick={closeModal}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold">إضافة سجل طبي جديد</h2>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 p-4 bg-gray-50 border-b border-gray-200">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step === currentStep
                    ? "bg-green-600 text-white"
                    : step < currentStep
                    ? "bg-green-200 text-green-800"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                {step}
              </div>
              {step < 3 && <div className="w-8 h-1 bg-gray-300 mx-2" />}
            </div>
          ))}
        </div>

        {/* Step Labels */}
        <div className="grid grid-cols-3 gap-2 p-4 bg-gray-50 border-b border-gray-200 text-center text-sm font-medium text-gray-700">
          <div>الأسرة والشخص</div>
          <div>البيانات الطبية</div>
          <div>المساعدة</div>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentStep === 1 && <Step1HouseholdPerson />}
          {currentStep === 2 && <Step2MedicalData />}
          {currentStep === 3 && <Step3AidSelection />}
        </div>
      </div>
    </div>
  );
}
