"use client";

import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, X, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";

type View = "login" | "forgot" | "forgotSuccess";

export function LoginModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { login } = useAuthStore();
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [view, setView] = useState<View>("login");

  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      onClose();
      router.push("/dashboard");
    } catch (err: any) {
      const msg = isRtl ? "البريد أو كلمة المرور غير صحيحة" : "Invalid email or password";
      setError(err?.message || msg);
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError("");
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      setView("forgotSuccess");
    } catch {
      setForgotError(isRtl ? "حدث خطأ، يرجى المحاولة مرة أخرى" : "An error occurred, please try again");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={cn(
        "relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transition-all duration-300",
        shake && "animate-[shake_0.5s_ease-in-out]"
      )}>
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 end-4 z-10 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ── LOGIN VIEW ── */}
        {view === "login" && (
          <div className="p-8">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-6">
              <div className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">CH</span>
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-white">Charity</span>
                <span className="font-bold text-green-500">Hub</span>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {isRtl ? "مرحباً بك" : "Welcome Back"}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              {isRtl ? "سجّل دخولك للمتابعة" : "Sign in to continue"}
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {isRtl ? "البريد الإلكتروني" : "Email"}
                </label>
                <div className="relative">
                  <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@organization.com"
                    required
                    className="w-full ps-10 pe-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-slate-900 dark:text-white placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {isRtl ? "كلمة المرور" : "Password"}
                  </label>
                  <button
                    type="button"
                    onClick={() => setView("forgot")}
                    className="text-xs text-green-600 dark:text-green-400 hover:underline"
                  >
                    {isRtl ? "نسيت كلمة المرور؟" : "Forgot password?"}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full ps-10 pe-10 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isRtl ? "جاري التحقق..." : "Verifying..."}
                  </>
                ) : (
                  isRtl ? "تسجيل الدخول" : "Sign In"
                )}
              </button>
            </form>

            <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-6">
              CharityHub © 2025
            </p>
          </div>
        )}

        {/* ── FORGOT VIEW ── */}
        {view === "forgot" && (
          <div className="p-8">
            <button
              onClick={() => setView("login")}
              className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mb-6 transition-colors"
            >
              <ArrowLeft className={cn("w-4 h-4", isRtl ? "" : "rotate-180")} />
              {isRtl ? "العودة لتسجيل الدخول" : "Back to Sign In"}
            </button>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
              {isRtl ? "استعادة كلمة المرور" : "Reset Password"}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              {isRtl
                ? "أدخل بريدك الإلكتروني وسيتواصل معك المسؤول"
                : "Enter your email and the admin will contact you"}
            </p>

            <form onSubmit={handleForgot} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {isRtl ? "البريد الإلكتروني" : "Email"}
                </label>
                <div className="relative">
                  <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@organization.com"
                    required
                    className="w-full ps-10 pe-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-slate-900 dark:text-white placeholder:text-slate-400"
                  />
                </div>
              </div>

              {forgotError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{forgotError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full py-2.5 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {forgotLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />{isRtl ? "جاري الإرسال..." : "Sending..."}</>
                ) : (
                  isRtl ? "إرسال الطلب" : "Send Request"
                )}
              </button>
            </form>
          </div>
        )}

        {/* ── FORGOT SUCCESS VIEW ── */}
        {view === "forgotSuccess" && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-9 h-9 text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {isRtl ? "تم إرسال طلبك" : "Request Sent"}
            </h2>
            <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
              <p>{isRtl ? "تم تسجيل طلب استعادة كلمة المرور." : "Your reset request has been recorded."}</p>
              <p>{isRtl ? "سيقوم المسؤول بمراجعة طلبك وتعيين كلمة مرور مؤقتة." : "The admin will review and set a temporary password."}</p>
              <p>{isRtl ? "تواصل مع المسؤول إذا لم تتلقَّ ردًا خلال 24 ساعة." : "Contact the admin if no response within 24 hours."}</p>
            </div>
            <button
              onClick={() => setView("login")}
              className="w-full py-2.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors"
            >
              {isRtl ? "العودة لتسجيل الدخول" : "Back to Sign In"}
            </button>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
