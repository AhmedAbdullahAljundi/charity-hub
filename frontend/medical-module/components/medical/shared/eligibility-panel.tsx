"use client";

import { AlertCircle, CheckCircle2, XCircle, Clock } from "lucide-react";
import { getEligibilityColor, getEligibilityLabel } from "@/lib/medical/utils";
import type { EligibilityLevel } from "@/types/medical";
import { Badge } from "./badge";

interface EligibilityPanelProps {
  eligibilityLevel: EligibilityLevel;
  personName: string;
  personAge: number;
}

export function EligibilityPanel({
  eligibilityLevel,
  personName,
  personAge,
}: EligibilityPanelProps) {
  const getIcon = () => {
    switch (eligibilityLevel) {
      case "fully_eligible":
        return <CheckCircle2 className="w-5 h-5" />;
      case "partial_eligible":
        return <AlertCircle className="w-5 h-5" />;
      case "not_eligible":
        return <XCircle className="w-5 h-5" />;
      case "pending":
        return <Clock className="w-5 h-5" />;
    }
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${getEligibilityColor(eligibilityLevel)}`}>
      <div className="flex items-center gap-3 mb-2">
        {getIcon()}
        <h3 className="font-semibold">نتيجة التقييم</h3>
      </div>
      <p className="text-sm mb-3 leading-relaxed">
        {personName} ({personAge} سنة) - <strong>{getEligibilityLabel(eligibilityLevel)}</strong>
      </p>
      <Badge
        label={getEligibilityLabel(eligibilityLevel)}
        color={getEligibilityColor(eligibilityLevel)}
        size="sm"
      />
    </div>
  );
}
