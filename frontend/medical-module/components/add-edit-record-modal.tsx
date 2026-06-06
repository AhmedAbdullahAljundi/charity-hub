'use client'

import { useState } from 'react'
import { MedicalRecord, DisbursementType, RelationshipType } from '@/types/medical'

interface AddEditRecordModalProps {
  record: MedicalRecord | null
  isOpen: boolean
  onClose: () => void
  onSave: (record: MedicalRecord) => void
}

const RELATIONSHIPS: RelationshipType[] = ['الزوج', 'الزوجة', 'ابن', 'ابنة', 'والد', 'والدة', 'أخ', 'أخت', 'أخرى']
const DISBURSEMENT_TYPES: DisbursementType[] = ['شهري', 'موسمي', 'زواج']

export function AddEditRecordModal({ record, isOpen, onClose, onSave }: AddEditRecordModalProps) {
  const defaultData: MedicalRecord = {
    id: '',
    recordNumber: '',
    classification: '',
    husbandName: '',
    wifeName: '',
    patientRelationship: 'الزوجة',
    patientName: '',
    disease: '',
    doctorName: '',
    treatmentCost: 0,
    disbursementType: 'شهري',
    recordDate: new Date().toISOString().split('T')[0],
    notes: '',
    eligibilityStatus: 'قيد_المراجعة',
    eligibilityReason: '',
    previousDisbursements: [],
  }

  const [formData, setFormData] = useState<MedicalRecord>(record || defaultData)

  // عند تغيير record، قم بتحديث formData
  if (isOpen && record && formData.id !== record.id) {
    setFormData(record)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === 'treatmentCost' ? parseFloat(value) : value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.id) {
      formData.id = Date.now().toString()
    }
    onSave(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
        <div className="sticky top-0 flex justify-between items-center p-6 border-b border-slate-100 bg-white">
          <h2 className="text-xl font-semibold text-slate-900">{record ? 'تعديل السجل' : 'إضافة سجل طبي'}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition text-2xl"
          >
            {'✕'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Row 1: Record Number and Classification */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">رقم القيد *</label>
              <input
                type="text"
                name="recordNumber"
                value={formData.recordNumber}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                placeholder="REC-001"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">التصنيف *</label>
              <input
                type="text"
                name="classification"
                value={formData.classification}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                placeholder="الفئة أ"
              />
            </div>
          </div>

          {/* Row 2: Husband and Wife Names */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">اسم الزوج *</label>
              <input
                type="text"
                name="husbandName"
                value={formData.husbandName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">اسم الزوجة *</label>
              <input
                type="text"
                name="wifeName"
                value={formData.wifeName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Row 3: Patient Name and Relationship */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">اسم المريض *</label>
              <input
                type="text"
                name="patientName"
                value={formData.patientName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">الصلة بالمريض *</label>
              <select
                name="patientRelationship"
                value={formData.patientRelationship}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              >
                {RELATIONSHIPS.map(rel => (
                  <option key={rel} value={rel}>{rel}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 4: Disease and Doctor */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">المرض *</label>
              <input
                type="text"
                name="disease"
                value={formData.disease}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">اسم الدكتور *</label>
              <input
                type="text"
                name="doctorName"
                value={formData.doctorName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Row 5: Cost and Disbursement Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">سعر العلاج (ج.م) *</label>
              <input
                type="number"
                name="treatmentCost"
                value={formData.treatmentCost}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">نوع الدعم *</label>
              <select
                name="disbursementType"
                value={formData.disbursementType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              >
                {DISBURSEMENT_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 6: Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">التاريخ *</label>
            <input
              type="date"
              name="recordDate"
              value={formData.recordDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Row 7: Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">ملاحظات</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm resize-none"
              rows={3}
              placeholder="أي ملاحظات إضافية..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium text-sm"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium text-sm"
            >
              {record ? 'تحديث' : 'إضافة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
