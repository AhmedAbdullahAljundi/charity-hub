"use client";

import { getAidTypeLabel } from "@/lib/medical/utils";
import type { AidType } from "@/types/medical";

const AID_TYPES: AidType[] = ["TREATMENT", "LAB_TEST", "IMAGING", "CONSULTATION", "SURGERY", "MEDICATION", "EQUIPMENT", "FINANCIAL_AID", "MARRIAGE_AID"] as any[];

interface AidTypeGridProps {
  selectedAidType: AidType | null;
  onSelect: (type: AidType) => void;
}

export function AidTypeGrid({ selectedAidType, onSelect }: AidTypeGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {AID_TYPES.map((type) => (
        <button
          key={type}
          onClick={() => onSelect(type)}
          className={`p-4 rounded-lg border-2 font-medium transition-all text-right ${
            selectedAidType === type
              ? "border-green-500 bg-green-50"
              : "border-gray-200 bg-white hover:border-gray-300"
          }`}
        >
          {getAidTypeLabel(type)}
        </button>
      ))}
    </div>
  );
}
