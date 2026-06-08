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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10">
          <button
            onClick={closeModal}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold bg-gradient-to-l from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
            إضافة سجل طبي جديد
          </h2>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 p-5 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  step === currentStep
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-4 ring-emerald-600/20"
                    : step < currentStep
                    ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                }`}
              >
                {step}
              </div>
              {step < 3 && (
                <div
                  className={`w-12 h-1 mx-2 rounded-full transition-colors duration-300 ${
                    step < currentStep ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-800"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Labels */}
        <div className="grid grid-cols-3 gap-2 px-6 py-3 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-center text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
          <div>الأسرة والشخص</div>
          <div>البيانات الطبية</div>
          <div>المساعدة</div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto bg-slate-50/30 dark:bg-slate-900/50">
          {currentStep === 1 && <Step1HouseholdPerson />}
          {currentStep === 2 && <Step2MedicalData />}
          {currentStep === 3 && <Step3AidSelection />}
        </div>
      </div>
    </div>
  );
}
