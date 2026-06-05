"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import { useLocale } from "next-intl";
import {
  Eye, EyeOff, Mail, Lock, Loader2, Target, Users,
  BarChart3, Heart, ArrowLeft, CheckCircle2,
} from "lucide-react";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ZakatCalculatorPopover } from "@/components/landing/ZakatCalculator";
import { cn } from "@/lib/utils";

type View = "login" | "forgot" | "forgotSuccess";

// ── Geometric SVG pattern overlay ──────────────────────────────────────────
function GeometricPattern() {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
        </pattern>
        <pattern id="diag" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 0 60 L 60 0" fill="none" stroke="white" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
      <rect width="100%" height="100%" fill="url(#diag)" />
    </svg>
  );
}

// ── Feature Card ────────────────────────────────────────────────────────────
function FeatureCard({
  icon: Icon, title, sub,
}: { icon: React.ElementType; title: string; sub: string }) {
  return (
    <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-2">
      <Icon className="w-6 h-6 text-green-400" />
      <p className="text-white text-sm font-semibold leading-tight">{title}</p>
      <p className="text-slate-400 text-xs">{sub}</p>
    </div>
  );
}

// ── Main Login Page ─────────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();
  const locale = useLocale();
  const isRtl = locale === "ar";
  const { login, isAuthenticated } = useAuthStore();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) router.replace("/dashboard");
  }, [isAuthenticated, router]);

  const [view, setView] = useState<View>("login");
  const [shake, setShake] = useState(false);

  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      router.push("/dashboard");
    } catch (err: any) {
      setError(
        isRtl
          ? "البريد أو كلمة المرور غير صحيحة"
          : "Invalid email or password"
      );
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
      setForgotError(
        isRtl
          ? "حدث خطأ، يرجى المحاولة مرة أخرى لاحقاً"
          : "An error occurred, please try again later"
      );
    } finally {
      setForgotLoading(false);
    }
  };

  const features = isRtl
    ? [
        { icon: Target,   title: "التقييم الدقيق",    sub: "9 طبقات حسابية" },
        { icon: Users,    title: "إدارة الأسر",       sub: "بيانات شاملة" },
        { icon: BarChart3,title: "تقارير وتحليلات",  sub: "مؤشرات فورية" },
      ]
    : [
        { icon: Target,   title: "Precise Scoring",   sub: "9 computation layers" },
        { icon: Users,    title: "Household Mgmt",    sub: "Comprehensive data" },
        { icon: BarChart3,title: "Reports & Analytics",sub: "Real-time indicators" },
      ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ── LEFT PANEL (60%) ─────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[60%] relative bg-gradient-to-br from-slate-900 via-[#1E3A2F] to-slate-900 flex-col items-center justify-center p-12 overflow-hidden">
        <GeometricPattern />

        {/* Logo */}
        <div className="relative z-10 text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="w-16 h-16 bg-green-500/20 border-2 border-green-500/40 rounded-2xl flex items-center justify-center">
              <Heart className="w-8 h-8 text-green-400" fill="currentColor" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white">
            Charity<span className="text-green-400">Hub</span>
          </h1>
          <p className="text-slate-300 text-lg mt-3">
            {isRtl ? "نظام استهداف المساعدات الاجتماعية" : "Social Assistance Targeting Platform"}
          </p>
          <p className="text-slate-500 text-sm mt-1 italic">
            {isRtl ? "Social Assistance Targeting Platform" : "نظام استهداف المساعدات الاجتماعية"}
          </p>
        </div>

        {/* Feature cards */}
        <div className="relative z-10 flex gap-4 w-full max-w-xl">
          {features.map((f) => (
            <FeatureCard key={f.title} icon={f.icon} title={f.title} sub={f.sub} />
          ))}
        </div>

        {/* Quote */}
        <p className="relative z-10 mt-10 text-slate-400 italic text-center text-sm max-w-md">
          {isRtl
            ? '"نحن لا نوزع مساعدات، نحن نستهدف الأحق بها"'
            : '"We don\'t distribute aid — we target those most deserving it."'}
        </p>
      </div>

      {/* ── RIGHT PANEL (40%) ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" fill="white" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-sm">
              Charity<span className="text-green-500">Hub</span>
            </span>
          </div>
          <div className="ms-auto flex items-center gap-1">
            <ZakatCalculatorPopover />
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
          <div className={cn(
            "w-full max-w-sm transition-all duration-300",
            shake && "[animation:shake_0.5s_ease-in-out]"
          )}>

            {/* ── LOGIN VIEW ── */}
            {view === "login" && (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {isRtl ? "مرحباً بك" : "Welcome Back"}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {isRtl ? "سجّل دخولك للمتابعة" : "Sign in to continue"}
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {isRtl ? "البريد الإلكتروني" : "Email"}
                    </label>
                    <div className="relative">
                      <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@organization.com"
                        required
                        className="w-full ps-10 pe-3 py-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
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
                      <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        type={showPwd ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full ps-10 pe-10 py-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-slate-900 dark:text-white transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd(!showPwd)}
                        className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      >
                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl">
                      <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 hover:shadow-green-500/30"
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

                <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-8">
                  CharityHub © 2025 —{" "}
                  {isRtl ? "جميع الحقوق محفوظة" : "All rights reserved"}
                  {" "}<span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full">v1.0</span>
                </p>
              </>
            )}

            {/* ── FORGOT VIEW ── */}
            {view === "forgot" && (
              <>
                <button
                  onClick={() => setView("login")}
                  className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 mb-6 transition-colors"
                >
                  <ArrowLeft className={cn("w-4 h-4", !isRtl && "rotate-180")} />
                  {isRtl ? "العودة لتسجيل الدخول" : "Back to Sign In"}
                </button>

                <div className="mb-6">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {isRtl ? "استعادة كلمة المرور" : "Reset Password"}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {isRtl
                      ? "أدخل بريدك الإلكتروني وسيتواصل معك المسؤول"
                      : "Enter your email and the admin will contact you"}
                  </p>
                </div>

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
                        className="w-full ps-10 pe-3 py-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-slate-900 dark:text-white placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {forgotError && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl">
                      <p className="text-sm text-red-600 dark:text-red-400">{forgotError}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    {forgotLoading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" />{isRtl ? "جاري الإرسال..." : "Sending..."}</>
                    ) : (
                      isRtl ? "إرسال الطلب" : "Send Request"
                    )}
                  </button>
                </form>
              </>
            )}

            {/* ── FORGOT SUCCESS ── */}
            {view === "forgotSuccess" && (
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  {isRtl ? "تم إرسال طلبك" : "Request Sent"}
                </h2>
                <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                  <p>{isRtl ? "تم تسجيل طلب استعادة كلمة المرور." : "Your password reset request has been recorded."}</p>
                  <p>{isRtl ? "سيقوم المسؤول بمراجعة طلبك وتعيين كلمة مرور مؤقتة." : "The admin will review and set a temporary password for you."}</p>
                  <p>{isRtl ? "تواصل مع المسؤول إذا لم تتلقَّ ردًا خلال 24 ساعة." : "Contact the admin if you don't receive a response within 24 hours."}</p>
                </div>
                <button
                  onClick={() => { setView("login"); setForgotEmail(""); }}
                  className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors"
                >
                  {isRtl ? "العودة لتسجيل الدخول" : "Back to Sign In"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}
