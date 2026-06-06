'use client'

import { useState } from 'react'
import { MedicalRecord } from '@/types/medical'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/medical/utils'

interface MedicalRecordsTableProps {
  records: MedicalRecord[]
  onEdit: (record: MedicalRecord) => void
  onDelete: (id: string) => void
  onViewEligibility?: (record: MedicalRecord) => void
}

export function MedicalRecordsTable({ records, onEdit, onDelete, onViewEligibility }: MedicalRecordsTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const recordsPerPage = 10
  const totalPages = Math.ceil(records.length / recordsPerPage)
  const startIndex = (currentPage - 1) * recordsPerPage
  const paginatedRecords = records.slice(startIndex, startIndex + recordsPerPage)

  return (
    <div className="w-full space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-4 py-3 text-right font-semibold text-slate-700 text-xs">رقم القيد</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700 text-xs">التصنيف</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700 text-xs">اسم الزوجة</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700 text-xs">اسم الزوج</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700 text-xs">الصلة بالمريض</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700 text-xs">المرض</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700 text-xs">اسم الدكتور</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700 text-xs">سعر العلاج</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700 text-xs">نوع الدعم</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700 text-xs">التاريخ</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700 text-xs">الحالة</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-700 text-xs">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedRecords.map((record) => (
              <tr key={record.id} className="bg-white hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3 text-slate-900 font-medium text-sm">{record.recordNumber}</td>
                <td className="px-4 py-3 text-slate-600 text-sm">{record.classification}</td>
                <td className="px-4 py-3 text-slate-600 text-sm">{record.wifeName}</td>
                <td className="px-4 py-3 text-slate-600 text-sm">{record.husbandName}</td>
                <td className="px-4 py-3 text-slate-600 text-sm">{record.patientRelationship}</td>
                <td className="px-4 py-3 text-slate-600 text-sm font-medium">{record.disease}</td>
                <td className="px-4 py-3 text-slate-600 text-sm">{record.doctorName}</td>
                <td className="px-4 py-3 text-slate-900 font-semibold text-sm">{formatCurrency(record.treatmentCost)}</td>
                <td className="px-4 py-3">
                  <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                    {record.disbursementType}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600 text-sm">{formatDate(record.recordDate)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(record.eligibilityStatus)}`}>
                    {record.eligibilityStatus}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => onViewEligibility?.(record)}
                      className="px-2.5 py-1.5 bg-emerald-100 text-emerald-700 rounded text-xs font-medium hover:bg-emerald-200 transition"
                      title="عرض الأهلية"
                    >
                      أهلية
                    </button>
                    <button
                      onClick={() => onEdit(record)}
                      className="px-2.5 py-1.5 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200 transition"
                      title="تعديل السجل"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => onDelete(record.id)}
                      className="px-2.5 py-1.5 bg-rose-100 text-rose-700 rounded text-xs font-medium hover:bg-rose-200 transition"
                      title="حذف السجل"
                    >
                      حذف
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-1">
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-700 disabled:opacity-50 hover:bg-slate-50 transition"
        >
          السابق
        </button>
        <div className="flex gap-0.5">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-2.5 py-1.5 rounded-lg text-sm ${currentPage === page ? 'bg-emerald-600 text-white' : 'border border-slate-200 text-slate-700 hover:bg-slate-50'} transition`}
            >
              {page}
            </button>
          ))}
        </div>
        <button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-700 disabled:opacity-50 hover:bg-slate-50 transition"
        >
          التالي
        </button>
      </div>
    </div>
  )
}
