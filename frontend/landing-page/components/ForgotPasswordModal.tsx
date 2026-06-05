'use client'

import { useState } from 'react'
import { Mail, ArrowRight, CheckCircle, Loader2 } from 'lucide-react'

interface ForgotPasswordProps {
  onBack: () => void
}

export default function ForgotPasswordModal({ onBack }: ForgotPasswordProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit request')
      }

      setSubmitted(true)
    } catch (err) {
      setError('حدث خطأ، يرجى المحاولة مرة أخرى لاحقاً')
    } finally {
      setIsLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            تم إرسال طلبك
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
            تم تسجيل طلب استعادة كلمة المرور.
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
            سيقوم المسؤول بمراجعة طلبك وتعيين كلمة مرور مؤقتة.
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
            تواصل مع المسؤول إذا لم تتلقَّ ردًا خلال 24 ساعة.
          </p>
        </div>

        <button
          onClick={onBack}
          className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
        >
          العودة لتسجيل الدخول
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 text-sm font-medium mb-4"
      >
        <ArrowRight className="w-4 h-4 rtl:rotate-180" />
        العودة
      </button>

      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          استعادة كلمة المرور
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          أدخل بريدك الإلكتروني وسيتواصل معك المسؤول
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
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

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !email}
          className="w-full py-2.5 px-4 bg-green-500 hover:bg-green-600 disabled:bg-slate-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              جاري الإرسال...
            </>
          ) : (
            'إرسال الطلب'
          )}
        </button>
      </form>
    </div>
  )
}
