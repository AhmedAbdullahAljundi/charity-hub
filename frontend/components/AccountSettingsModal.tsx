"use client";

import { useState } from "react";
import { X, Lock, Eye, EyeOff, Loader2, CheckCircle2, User, Mail, Shield, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/lib/stores/authStore";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { checkPasswordStrength } from "@/lib/utils/passwordStrength";

function RuleItem({ met, label }: { met: boolean; label: string }) {
  return (
    <li className={cn("flex items-center gap-2 text-xs transition-colors", met ? "text-green-600 dark:text-green-400" : "text-slate-400 dark:text-slate-500")}>
      <CheckCircle2 className={cn("w-3.5 h-3.5 shrink-0", met ? "text-green-500" : "text-slate-300 dark:text-slate-600")} />
      {label}
    </li>
  );
}

export function AccountSettingsModal({ onClose }: { onClose: () => void }) {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const { user, token } = useAuthStore();

  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showC, setShowC] = useState(false);
  const [showN, setShowN] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

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
      setTimeout(() => {
        setSuccess(false);
        setCurrent("");
        setNext("");
        setConfirm("");
      }, 3000);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {isRtl ? "إعدادات الحساب" : "Account Settings"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            className={cn(
              "flex-1 py-3 text-sm font-medium border-b-2 transition-colors",
              activeTab === "profile"
                ? "border-green-500 text-green-600 dark:text-green-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
            onClick={() => setActiveTab("profile")}
          >
            {isRtl ? "الملف الشخصي" : "Profile"}
          </button>
          <button
            className={cn(
              "flex-1 py-3 text-sm font-medium border-b-2 transition-colors",
              activeTab === "password"
                ? "border-green-500 text-green-600 dark:text-green-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
            onClick={() => setActiveTab("password")}
          >
            {isRtl ? "تغيير كلمة المرور" : "Change Password"}
          </button>
        </div>

        <div className="p-6">
          {activeTab === "profile" ? (
            <div className="space-y-6">
              <div className="flex items-center justify-center">
                <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-4xl font-bold border-4 border-white dark:border-slate-800 shadow-lg">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <User className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">{isRtl ? "الاسم" : "Name"}</p>
                    <p className="font-medium text-slate-900 dark:text-white">{user?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <Mail className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">{isRtl ? "البريد الإلكتروني" : "Email"}</p>
                    <p className="font-medium text-slate-900 dark:text-white">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <Shield className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">{isRtl ? "الدور والصلاحيات" : "Role"}</p>
                    <p className="font-medium text-slate-900 dark:text-white">{user?.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {success ? (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="w-6 h-6 shrink-0" />
                  <p className="text-sm font-medium">
                    {isRtl ? "تم تغيير كلمة المرور بنجاح" : "Password changed successfully"}
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {isRtl ? "كلمة المرور الحالية" : "Current Password"}
                    </label>
                    <div className="relative">
                      <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type={showC ? "text" : "password"}
                        value={current}
                        onChange={(e) => setCurrent(e.target.value)}
                        required
                        className="w-full ps-10 pe-10 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 text-slate-900 dark:text-white transition-all"
                      />
                      <button type="button" onClick={() => setShowC(!showC)} className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showC ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

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
                        className="w-full ps-10 pe-10 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 text-slate-900 dark:text-white transition-all"
                      />
                      <button type="button" onClick={() => setShowN(!showN)} className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showN ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {next.length > 0 && (
                      <div className="space-y-2 mt-2">
                        <div className="flex gap-1" dir="ltr">{strengthBar}</div>
                        <ul className="space-y-1 mt-2">
                          <RuleItem met={strength.checks.length} label={isRtl ? "8 أحرف على الأقل" : "At least 8 characters"} />
                          <RuleItem met={strength.checks.hasNumber} label={isRtl ? "يحتوي على أرقام" : "Contains numbers"} />
                          <RuleItem met={strength.checks.hasUpper} label={isRtl ? "يحتوي على حروف كبيرة" : "Contains uppercase"} />
                          <RuleItem met={strength.checks.hasSymbol} label={isRtl ? "يحتوي على رموز (!@#$)" : "Contains symbols (!@#$)"} />
                        </ul>
                      </div>
                    )}
                  </div>

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
                          "w-full ps-10 pe-10 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border rounded-xl focus:outline-none focus:ring-2 text-slate-900 dark:text-white transition-all",
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
                      <p className="text-xs text-red-500 mt-1">
                        {isRtl ? "كلمتا المرور غير متطابقتين" : "Passwords do not match"}
                      </p>
                    )}
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!allValid || loading}
                    className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all mt-6"
                  >
                    {loading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" />{isRtl ? "جاري الحفظ..." : "Saving..."}</>
                    ) : (
                      isRtl ? "تغيير كلمة المرور" : "Change Password"
                    )}
                  </button>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
