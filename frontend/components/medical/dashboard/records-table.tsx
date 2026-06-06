"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMedicalStore } from "../../../lib/stores/medicalStore";

import {
  formatCurrency,
  formatDateShort,
  getEligibilityColor,
  getEligibilityLabel,
  getStatusColor,
  getStatusLabel,
  getAidTypeLabel,
} from "@/lib/medical/utils";
import { AgeCircle } from "../shared/age-circle";
import { Badge } from "../shared/badge";
import type { MedicalCase } from "../../../types/medical";

export function MedicalRecordsTable({ records }: { records: MedicalCase[] }) {
  const { currentPage, totalPages, loadCases } = useMedicalStore();
  const pageSize = 10;
  
  const setCurrentPage = (page: number) => {
    loadCases({ page, limit: pageSize });
  }

  // Paginate is now handled by the backend! So records are ALREADY paginated.
  // We can just render records directly.
  const paginatedRecords = records;
  const startIdx = (currentPage - 1) * pageSize;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">الشخص</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                المساعدة
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                المبلغ
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                الاستحقاق
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">الحالة</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">التاريخ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedRecords.length > 0 ? (
              paginatedRecords.map((record: MedicalCase) => (
                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex gap-3 items-center justify-end">
                      <div>
                        <p className="font-medium">{record.personName}</p>
                        <p className="text-xs text-gray-500">
                          {record.conditionName || "بدون سجل"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      label={record.isCritical ? 'حالة حرجة' : 'عادية'}
                      color={record.isCritical ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}
                      size="sm"
                    />
                  </td>
                  <td className="px-6 py-4 font-semibold text-green-700">
                    {record.estimatedMonthlyCost ? `${record.estimatedMonthlyCost} ج.م` : 'غير محدد'}
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      label={record.assistanceType || 'غير محدد'}
                      color="bg-gray-100 text-gray-800"
                      size="sm"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      label={record.isActive ? 'نشط' : 'مغلق'}
                      color={record.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                      size="sm"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {record.createdAt ? new Date(record.createdAt).toLocaleDateString('ar-EG') : ''}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  لم يتم العثور على سجلات مطابقة
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-sm text-gray-600">
          عرض {startIdx + 1}-{Math.min(startIdx + pageSize, records.length)} من{" "}
          {records.length}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-2 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 rounded-lg font-medium transition-colors ${
                  currentPage === i + 1
                    ? "bg-green-600 text-white"
                    : "hover:bg-gray-200"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="p-2 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
