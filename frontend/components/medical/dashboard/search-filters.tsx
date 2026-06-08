"use client";

import { Search, X } from "lucide-react";
import { useDashboardFiltersStore } from "@/lib/medical/store";
import type { AidType, EligibilityLevel } from "@/types/medical";
import { getAidTypeLabel, getEligibilityLabel, getStatusLabel } from "@/lib/medical/utils";

export function SearchFilters() {
  const {
    filters,
    setSearch,
    setStatus,
    setAidType,
    setEligibilityLevel,
    resetFilters,
  } = useDashboardFiltersStore();

  const aidTypes: AidType[] = ["TREATMENT", "LAB_TEST", "IMAGING", "CONSULTATION", "SURGERY", "FINANCIAL_AID", "MARRIAGE_AID"];
  const statuses: ("pending" | "approved" | "disbursed" | "rejected")[] = ["pending", "approved", "disbursed", "rejected"];
  const eligibilityLevels: EligibilityLevel[] = ["fully_eligible", "partial_eligible", "not_eligible", "pending"];

  const hasActiveFilters =
    filters.search ||
    filters.status ||
    filters.aidType ||
    filters.eligibilityLevel;

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="ابحث عن اسم أو رقم..."
          value={filters.search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-right"
        />
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-2">
        {/* Status Filter */}
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() =>
              setStatus(filters.status === status ? undefined : status)
            }
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filters.status === status
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {getStatusLabel(status)}
          </button>
        ))}
      </div>

      {/* Aid Type Filter */}
      <div className="flex flex-wrap gap-2">
        {aidTypes.map((type) => (
          <button
            key={type}
            onClick={() =>
              setAidType(filters.aidType === type ? undefined : type)
            }
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filters.aidType === type
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {getAidTypeLabel(type)}
          </button>
        ))}
      </div>

      {/* Eligibility Filter */}
      <div className="flex flex-wrap gap-2">
        {eligibilityLevels.map((level) => (
          <button
            key={level}
            onClick={() =>
              setEligibilityLevel(
                filters.eligibilityLevel === level ? undefined : level
              )
            }
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filters.eligibilityLevel === level
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {getEligibilityLabel(level)}
          </button>
        ))}
      </div>

      {/* Reset Button */}
      {hasActiveFilters && (
        <button
          onClick={resetFilters}
          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm"
        >
          <X className="w-4 h-4" />
          مسح الفلاتر
        </button>
      )}
    </div>
  );
}
