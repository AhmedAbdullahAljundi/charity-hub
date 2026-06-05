"use client";

import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import { useLocale } from "next-intl";
import { ShieldOff, ArrowLeft } from "lucide-react";
import { getRoleBadgeClass } from "@/lib/hooks/usePermission";

const ROLE_LABELS: Record<string, { ar: string; en: string }> = {
  ADMIN:      { ar: "مدير النظام",   en: "System Admin" },
  SUPERVISOR: { ar: "مشرف",          en: "Supervisor" },
  WORKER:     { ar: "موظف إدخال",   en: "Data Entry" },
  VIEWER:     { ar: "مستعرض",        en: "Viewer" },
};

export default function Page403() {
  const router = useRouter();
  const locale = useLocale();
  const isRtl = locale === "ar";
  const user = useAuthStore((s) => s.user);
  const role = user?.role ?? "";
  const roleLabel = role ? (isRtl ? ROLE_LABELS[role]?.ar : ROLE_LABELS[role]?.en) : role;

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl ring-1 ring-slate-200 dark:ring-slate-700 p-10 max-w-md w-full text-center">
        {/* Icon */}
        <div className="w-20 h-20 bg-green-50 dark:bg-green-950/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldOff className="w-10 h-10 text-green-500" />
        </div>

        {/* Code */}
        <p className="text-6xl font-black text-slate-200 dark:text-slate-700 mb-2">403</p>

        {/* Title */}
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          {isRtl ? "غير مصرح" : "Access Forbidden"}
        </h1>

        {/* Message */}
        <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed">
          {isRtl
            ? "ليس لديك صلاحية للوصول لهذه الصفحة."
            : "You don't have permission to access this page."}
        </p>

        {/* Role badge */}
        {role && (
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {isRtl ? "دورك الحالي:" : "Your role:"}
            </span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getRoleBadgeClass(role)}`}>
              {roleLabel}
            </span>
          </div>
        )}

        {/* Back button */}
        <button
          onClick={() => router.push("/dashboard")}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors"
        >
          <ArrowLeft className={`w-4 h-4 ${!isRtl ? "rotate-180" : ""}`} />
          {isRtl ? "العودة للرئيسية" : "Back to Dashboard"}
        </button>
      </div>
    </div>
  );
}
