"use client";

import { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { useAuthStore } from "@/lib/stores/authStore";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { checkPasswordStrength } from "@/lib/utils/passwordStrength";
import { useRouter } from "@/i18n/navigation";

function RuleItem({ met, label }: { met: boolean; label: string }) {
  return (
    <li className={cn("flex items-center gap-2 text-xs transition-colors", met ? "text-green-600 dark:text-green-400" : "text-slate-400 dark:text-slate-500")}>
      <CheckCircle2 className={cn("w-3.5 h-3.5 shrink-0", met ? "text-green-500" : "text-slate-300 dark:text-slate-600")} />
      {label}
    </li>
  );
}

export function ForcePasswordChange() {
  const router = useRouter();
  const locale = useLocale();
  const isRtl = locale === "ar";
  const { user, token, fetchMe } = useAuthStore();

  const [current, setCurrent]   = useState("");
  const [next, setNext]         = useState("");
  const [confirm, setConfirm]   = useState("");
  const [showC, setShowC]       = useState(false);
  const [showN, setShowN]       = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState(false);

  const strength = checkPasswordStrength(next);
  const mismatch = confirm.length > 0 && next !== confirm;
  const allValid =
    current.length > 0 &&
    strength.checks.length &&
    strength.checks.hasNumber &&
    !mismatch &&
    confirm.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allValid) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      setSuccess(true);
      await fetchMe();
      setTimeout(() => router.replace("/dashboard"), 1500);
    } catch (err: any) {
      setError(err.message || (isRtl ? "حدث خطأ، حاول مجدداً" : "An error occurred, try again"));
    } finally {
      setLoading(false);
    }
  };

  const strengthBar = [0, 1, 2, 3].map((i) => (
    <div
      key={i}
      className={cn(
        "h-1.5 flex-1 rounded-full transition-all duration-300",
        strength.score > i ? strength.bgColor : "bg-slate-200 dark:bg-slate-700"
      )}
    />
  ));

  if (success) {
    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {isRtl ? "تم تغيير كلمة المرور بنجاح" : "Password Changed Successfully"}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            {isRtl ? "جاري التحويل..." : "Redirecting..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isRtl ? "يجب تغيير كلمة المرور" : "Password Change Required"}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            {isRtl
              ? "تم تعيين كلمة مرور مؤقتة لك. يجب تغييرها قبل المتابعة."
              : "A temporary password was set for you. You must change it before continuing."}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl ring-1 ring-slate-200 dark:ring-slate-700 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {isRtl ? "كلمة المرور الحالية (المؤقتة)" : "Current Password (Temporary)"}
              </label>
              <div className="relative">
                <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showC ? "text" : "password"}
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  required
                  className="w-full ps-10 pe-10 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 text-slate-900 dark:text-white transition-all"
                />
                <button type="button" onClick={() => setShowC(!showC)} className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showC ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {isRtl ? "كلمة المرور الجديدة" : "New Password"}
              </label>
              <div className="relative">
                <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showN ? "text" : "password"}
                  value={next}
                  onChange={(e) => setNext(e.target.value)}
                  required
                  className="w-full ps-10 pe-10 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 text-slate-900 dark:text-white transition-all"
                />
                <button type="button" onClick={() => setShowN(!showN)} className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showN ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Strength bar */}
              {next.length > 0 && (
                <div className="space-y-2">
                  <div className="flex gap-1" dir="ltr">{strengthBar}</div>
                  <p className={cn("text-xs font-medium", strength.color)}>{strength.label}</p>
                  <ul className="space-y-1">
                    <RuleItem met={strength.checks.length}    label={isRtl ? "8 أحرف على الأقل" : "At least 8 characters"} />
                    <RuleItem met={strength.checks.hasNumber} label={isRtl ? "يحتوي على أرقام" : "Contains numbers"} />
                    <RuleItem met={strength.checks.hasUpper}  label={isRtl ? "يحتوي على حروف كبيرة" : "Contains uppercase"} />
                    <RuleItem met={strength.checks.hasSymbol} label={isRtl ? "يحتوي على رموز (!@#$)" : "Contains symbols (!@#$)"} />
                  </ul>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {isRtl ? "تأكيد كلمة المرور الجديدة" : "Confirm New Password"}
              </label>
              <div className="relative">
                <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showConf ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  className={cn(
                    "w-full ps-10 pe-10 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border rounded-xl focus:outline-none focus:ring-2 text-slate-900 dark:text-white transition-all",
                    mismatch
                      ? "border-red-300 dark:border-red-700 focus:ring-red-300"
                      : "border-slate-200 dark:border-slate-700 focus:ring-green-400"
                  )}
                />
                <button type="button" onClick={() => setShowConf(!showConf)} className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showConf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {mismatch && (
                <p className="text-xs text-red-500 dark:text-red-400">
                  {isRtl ? "كلمتا المرور غير متطابقتين" : "Passwords do not match"}
                </p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={!allValid || loading}
              className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-500/20"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" />{isRtl ? "جاري الحفظ..." : "Saving..."}</>
              ) : (
                isRtl ? "تغيير كلمة المرور والمتابعة" : "Change Password & Continue"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-4">
          {isRtl ? "لا يمكن تخطي هذه الخطوة" : "This step cannot be skipped"}
        </p>
      </div>
    </div>
  );
}
