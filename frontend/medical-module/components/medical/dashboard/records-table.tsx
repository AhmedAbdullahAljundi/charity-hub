"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useDashboardFiltersStore, usePaginationStore } from "@/lib/medical/store";
import { mockAidDisbursements } from "@/lib/medical/mock-data";
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
import type { AidDisbursement } from "@/types/medical";

export function RecordsTable() {
  const filters = useDashboardFiltersStore((s) => s.filters);
  const { currentPage, pageSize, setCurrentPage } = usePaginationStore();

  // Filter records
  const filtered = mockAidDisbursements.filter((record) => {
    if (
      filters.search &&
      !record.personName.includes(filters.search) &&
      !record.id.includes(filters.search)
    ) {
      return false;
    }
    if (filters.status && record.status !== filters.status) return false;
    if (filters.aidType && record.aidType !== filters.aidType) return false;
    if (
      filters.eligibilityLevel &&
      record.eligibilityLevel !== filters.eligibilityLevel
    ) {
      return false;
    }
    return true;
  });

  // Paginate
  const totalPages = Math.ceil(filtered.length / pageSize);
  const startIdx = (currentPage - 1) * pageSize;
  const paginatedRecords = filtered.slice(startIdx, startIdx + pageSize);

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
              paginatedRecords.map((record: AidDisbursement) => (
                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex gap-3 items-center justify-end">
                      <div>
                        <p className="font-medium">{record.personName}</p>
                        <p className="text-xs text-gray-500">
                          {record.medicalRecord?.medicalCondition || "بدون سجل"}
                        </p>
                      </div>
                      <AgeCircle age={record.age} size="sm" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      label={getAidTypeLabel(record.aidType)}
                      color="bg-blue-100 text-blue-800 border-blue-300"
                      size="sm"
                    />
                  </td>
                  <td className="px-6 py-4 font-semibold text-green-700">
                    {formatCurrency(record.amount)}
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      label={getEligibilityLabel(record.eligibilityLevel)}
                      color={getEligibilityColor(record.eligibilityLevel)}
                      size="sm"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      label={getStatusLabel(record.status)}
                      color={getStatusColor(record.status)}
                      size="sm"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDateShort(record.disbursementDate)}
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
          عرض {startIdx + 1}-{Math.min(startIdx + pageSize, filtered.length)} من{" "}
          {filtered.length}
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
