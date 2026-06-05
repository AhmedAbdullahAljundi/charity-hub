'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/stores/authStore'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react'
import ForgotPasswordModal from '@/components/ForgotPasswordModal'

export default function LoginPageClient() {
  const router = useRouter()
  const { login, isLoading, error, isAuthenticated } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isShaking, setIsShaking] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(email, password)
      router.push('/dashboard')
    } catch {
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 500)
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[60%_40%]">
      {/* Left Panel - Visual */}
      <div
        className="hidden md:flex flex-col items-center justify-center px-8 py-12 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E3A2F 100%)',
        }}
      >
        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              'linear-gradient(45deg, transparent 48%, white 49%, white 51%, transparent 52%), linear-gradient(-45deg, transparent 48%, white 49%, white 51%, transparent 52%)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10 max-w-sm text-center">
          {/* Logo */}
          <div className="mb-12 flex justify-center">
            <div className="flex items-center gap-3">
              <div className="relative w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm1-13h-2v6l5.25 3.15.75-1.23-3-1.8V7z" />
                </svg>
              </div>
              <div className="text-start">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">Charity</span>
                  <span className="text-3xl font-bold text-green-500">Hub</span>
                </div>
              </div>
            </div>
          </div>

          {/* Subtitle */}
          <div className="mb-2 text-slate-300 text-base font-medium">
            نظام استهداف المساعدات الاجتماعية
          </div>
          <div className="mb-12 text-slate-500 text-sm italic">
            Social Assistance Targeting Platform
          </div>

          {/* Feature Cards */}
          <div className="space-y-3 mb-12">
            {[
              {
                icon: '📊',
                title: 'التقييم الدقيق',
                subtitle: '9 طبقات حسابية',
              },
              {
                icon: '👥',
                title: 'إدارة الأسر',
                subtitle: 'بيانات شاملة',
              },
              {
                icon: '📈',
                title: 'تقارير وتحليلات',
                subtitle: 'مؤشرات فورية',
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg border"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl mt-1">{feature.icon}</div>
                  <div className="text-start">
                    <div className="font-semibold text-white">{feature.title}</div>
                    <div className="text-xs text-slate-400">{feature.subtitle}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quote */}
          <div className="text-slate-400 italic text-sm leading-relaxed">
            "نحن لا نوزع مساعدات، نحن نستهدف الأحق بها"
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex flex-col items-center justify-center px-6 py-12 bg-white dark:bg-slate-800">
        <div className="w-full max-w-sm">
          {showForgotPassword ? (
            <ForgotPasswordModal onBack={() => setShowForgotPassword(false)} />
          ) : (
            <>
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  مرحباً بك
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  سجّل دخولك للمتابعة
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@organization.com"
                      className="w-full px-4 py-2 pe-10 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                      disabled={isLoading}
                      required
                    />
                    <Mail className="absolute end-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      كلمة المرور
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-xs text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium"
                    >
                      نسيت كلمة المرور؟
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2 pe-10 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                      disabled={isLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-green-500 focus:ring-green-500"
                    disabled={isLoading}
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    تذكرني لمدة 7 أيام
                  </span>
                </label>

                {/* Error Message */}
                {error && (
                  <div
                    className={`p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 ${isShaking ? 'animate-pulse' : ''}`}
                  >
                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-green-500 hover:bg-green-600 disabled:bg-slate-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      جاري التحقق...
                    </>
                  ) : (
                    'تسجيل الدخول'
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 text-center text-xs text-slate-500 dark:text-slate-400">
                <p>CharityHub © 2025 — جميع الحقوق محفوظة</p>
                <p className="mt-1">v1.0</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
