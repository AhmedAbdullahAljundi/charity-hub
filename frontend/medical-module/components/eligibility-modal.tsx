'use client'

import { MedicalRecord } from '@/types/medical'
import { calculateEligibility, formatCurrency, formatDate } from '@/lib/medical/utils'

interface EligibilityModalProps {
  record: MedicalRecord | null
  isOpen: boolean
  onClose: () => void
}

export function EligibilityModal({ record, isOpen, onClose }: EligibilityModalProps) {
  if (!isOpen || !record) return null

  const eligibility = calculateEligibility(record)

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
        <div className="sticky top-0 flex justify-between items-center p-6 border-b border-slate-100 bg-white">
          <h2 className="text-xl font-semibold text-slate-900">تقييم الأهلية</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition text-2xl"
          >
            {'✕'}
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Record Info */}
          <div className="bg-slate-50 p-6 rounded-xl space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></span>
              بيانات السجل
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <span className="text-xs font-medium text-slate-600 block mb-1">رقم القيد</span>
                <p className="text-sm font-semibold text-slate-900">{record.recordNumber}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-600 block mb-1">التصنيف</span>
                <p className="text-sm font-semibold text-slate-900">{record.classification}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-600 block mb-1">اسم الزوج</span>
                <p className="text-sm font-semibold text-slate-900">{record.husbandName}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-600 block mb-1">اسم الزوجة</span>
                <p className="text-sm font-semibold text-slate-900">{record.wifeName}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-600 block mb-1">المرض</span>
                <p className="text-sm font-semibold text-slate-900">{record.disease}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-600 block mb-1">التكلفة</span>
                <p className="text-sm font-semibold text-slate-900">{formatCurrency(record.treatmentCost)}</p>
              </div>
            </div>
          </div>

          {/* Eligibility Result */}
          <div className={`p-6 rounded-xl border-l-4 ${
            eligibility.isEligible 
              ? 'bg-emerald-50 border-emerald-400' 
              : 'bg-rose-50 border-rose-400'
          }`}>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${eligibility.isEligible ? 'bg-emerald-600' : 'bg-rose-600'}`}></span>
              حالة الأهلية
            </h3>
            <div className="space-y-3">
              <p className={`text-lg font-bold ${eligibility.isEligible ? 'text-emerald-700' : 'text-rose-700'}`}>
                {eligibility.isEligible ? 'مقبول' : 'غير مقبول'}
              </p>
              <p className={`text-sm ${eligibility.isEligible ? 'text-emerald-700' : 'text-rose-700'}`}>
                {eligibility.reason}
              </p>
            </div>
          </div>

          {/* Eligibility Criteria */}
          <div className="bg-slate-50 p-6 rounded-xl">
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></span>
              معايير الأهلية
            </h3>
            <div className="space-y-3">
              {eligibility.conditions.map((condition, index) => (
                <div key={index} className="flex items-start gap-3 text-sm">
                  <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-semibold ${
                    condition.passed ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}>
                    {condition.passed ? '✓' : '✕'}
                  </span>
                  <span className={`${condition.passed ? 'text-slate-700' : 'text-slate-500'}`}>
                    {condition.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {eligibility.notes && (
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
              <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <span>ℹ️</span>
                ملاحظات
              </h3>
              <p className="text-sm text-blue-800">{eligibility.notes}</p>
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="sticky bottom-0 flex justify-end gap-3 p-6 border-t border-slate-100 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-medium text-sm"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  )
}
