"use client";

import { AlertCircle, CheckCircle2, XCircle, Clock } from "lucide-react";
import { getEligibilityColor, getEligibilityLabel } from "@/lib/medical/utils";
import type { EligibilityLevel } from "@/types/medical";
import { Badge } from "./badge";

interface EligibilityPanelProps {
  eligibilityLevel: EligibilityLevel | "pending_aid_selection";
  personName: string;
  personAge: number;
  lastDisbursementDate?: string | null;
  householdScore?: number | null;
}

export function EligibilityPanel({
  eligibilityLevel,
  personName,
  personAge,
  lastDisbursementDate,
  householdScore,
}: EligibilityPanelProps) {
  const getIcon = () => {
    switch (eligibilityLevel) {
      case "OK":
      case "fully_eligible":
        return <CheckCircle2 className="w-5 h-5" />;
      case "WARNING":
      case "partial_eligible":
        return <AlertCircle className="w-5 h-5" />;
      case "BLOCKED":
      case "not_eligible":
        return <XCircle className="w-5 h-5" />;
      case "pending_aid_selection":
        return <AlertCircle className="w-5 h-5 text-slate-400" />;
      case "pending":
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getPanelColor = () => {
    if (eligibilityLevel === "pending_aid_selection") {
      return "bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-400";
    }
    return getEligibilityColor(eligibilityLevel);
  };

  return (
    <div className={`p-5 rounded-xl border-2 transition-all shadow-sm ${getPanelColor()}`}>
      <div className="flex items-center gap-3 mb-2">
        {getIcon()}
        <h3 className="font-bold text-sm">
          {eligibilityLevel === "pending_aid_selection" ? "اختر الإجراء الطبي للتقييم" : "نتيجة التقييم"}
        </h3>
      </div>
      <p className="text-sm mb-3 leading-relaxed opacity-90">
        {personName} ({personAge} سنة) 
        {eligibilityLevel !== "pending_aid_selection" && (
          <> - <strong>{getEligibilityLabel(eligibilityLevel)}</strong></>
        )}
      </p>

      <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-black/5 dark:border-white/5">
        {eligibilityLevel !== "pending_aid_selection" && (
          <Badge
            label={getEligibilityLabel(eligibilityLevel)}
            color={getEligibilityColor(eligibilityLevel)}
            size="sm"
          />
        )}
        
        {householdScore !== undefined && householdScore !== null && (
          <Badge
            label={`تقييم الأسرة: ${Number(householdScore).toFixed(1)}%`}
            color={householdScore >= 40 ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"}
            size="sm"
          />
        )}

        {lastDisbursementDate && (
          <Badge
            label={`آخر مساعدة: ${new Date(lastDisbursementDate).toLocaleDateString('ar-EG')}`}
            color="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
            size="sm"
          />
        )}
        {!lastDisbursementDate && (
          <Badge
            label="لا يوجد إعانات سابقة"
            color="bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
            size="sm"
          />
        )}
      </div>
    </div>
  );
}
