"use client";

import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";

export function WarningBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <h3 className="font-semibold text-amber-900">تنبيه مهم</h3>
        <p className="text-sm text-amber-800 mt-1">
          يرجى التحقق من جميع البيانات قبل الموافقة على المساعدات. جميع المعلومات سيتم حفظها في نظام السجلات.
        </p>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="text-amber-600 hover:text-amber-800 flex-shrink-0"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
