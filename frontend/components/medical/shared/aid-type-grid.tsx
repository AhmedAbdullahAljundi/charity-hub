"use client";

import { getAidTypeLabel } from "@/lib/medical/utils";
import type { AidType } from "@/types/medical";

const GROUPS: { title: string; description: string; types: AidType[] }[] = [
  {
    title: "خدمة طبية",
    description: "الكشف، العلاج، التحاليل، الأشعات، والعمليات.",
    types: ["CONSULTATION", "TREATMENT", "LAB_TEST", "IMAGING", "SURGERY"],
  },
  {
    title: "إعانات",
    description: "الإعانات المالية وإعانات الزواج.",
    types: ["FINANCIAL_AID", "MARRIAGE_AID"],
  },
];

interface AidTypeGridProps {
  selectedAidType: AidType | null;
  onSelect: (type: AidType) => void;
}

export function AidTypeGrid({ selectedAidType, onSelect }: AidTypeGridProps) {
  return (
    <div className="space-y-5">
      {GROUPS.map((group) => (
        <section key={group.title} className="space-y-3">
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{group.title}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{group.description}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {group.types.map((type) => (
              <button
                key={type}
                onClick={() => onSelect(type)}
                className={`p-4 rounded-xl border-2 font-bold transition-all text-right shadow-sm ${
                  selectedAidType === type
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-900 dark:text-emerald-300"
                    : "border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-emerald-200 dark:hover:border-emerald-500/50 text-slate-800 dark:text-slate-100"
                }`}
              >
                {getAidTypeLabel(type)}
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
