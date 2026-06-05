'use client'

import { useState } from 'react'
import { Key, Eye, EyeOff, Copy, Loader2, Zap } from 'lucide-react'
import { generateTempPassword } from '@/lib/utils/passwordStrength'

interface SetTempPasswordModalProps {
  user: { id: string; name: string; email: string }
  onClose: () => void
  onSuccess: (userId: string) => void
}

export default function SetTempPasswordModal({
  user,
  onClose,
  onSuccess,
}: SetTempPasswordModalProps) {
  const [tempPassword, setTempPassword] = useState(generateTempPassword())
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleGenerate = () => {
    setTempPassword(generateTempPassword())
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(tempPassword)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      setError('فشل نسخ كلمة المرور')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (tempPassword.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/users/${user.id}/set-temp-password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth-token')}`,
        },
        body: JSON.stringify({ tempPassword }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'فشل تعيين كلمة المرور المؤقتة')
      }

      onSuccess(user.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-2xl w-full max-w-sm">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/30 p-4 border-b border-amber-200 dark:border-amber-800 rounded-t-lg">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            تعيين كلمة مرور مؤقتة
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            للمستخدم: <span className="font-medium">{user.name}</span> ({user.email})
          </p>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              كلمة المرور المؤقتة
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                  className="w-full px-3 py-2 pe-9 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 font-mono"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <button
                type="button"
                onClick={handleGenerate}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                disabled={isLoading}
                title="توليد تلقائي"
              >
                <Zap className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                disabled={isLoading}
                title="نسخ"
              >
                {copied ? (
                  <span className="text-green-600 dark:text-green-400 text-xs font-medium">
                    ✓
                  </span>
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Warning Box */}
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-sm text-amber-900 dark:text-amber-200">
              <strong>⚠ تنبيه:</strong> أخبر المستخدم بكلمة المرور هذه مباشرة
            </p>
            <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">
              سيُطلب منه تغييرها فور تسجيل الدخول
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white rounded-lg transition-colors"
              disabled={isLoading}
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isLoading || tempPassword.length < 8}
              className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-400 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جاري التعيين...
                </>
              ) : (
                'تأكيد التعيين'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
