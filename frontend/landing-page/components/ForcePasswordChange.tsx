'use client'

import { useState, useEffect } from 'react'
import { Lock, Eye, EyeOff, Check, X, Loader2 } from 'lucide-react'
import { checkPasswordStrength } from '@/lib/utils/passwordStrength'
import { useAuthStore } from '@/lib/stores/authStore'
import { useRouter } from 'next/navigation'

export default function ForcePasswordChange() {
  const router = useRouter()
  const { user, setUser } = useAuthStore()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const passwordStrength = checkPasswordStrength(newPassword)
  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword
  const allFieldsFilled =
    currentPassword && newPassword && confirmPassword && passwordsMatch

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!allFieldsFilled) return

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${useAuthStore.getState().token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to change password')
      }

      setSuccess(true)
      if (user) {
        setUser({ ...user, mustChangePassword: false })
      }

      setTimeout(() => {
        router.push('/dashboard')
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user?.mustChangePassword) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/30 p-6 border-b border-amber-200 dark:border-amber-800 rounded-t-xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                يجب تغيير كلمة المرور
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                تم تعيين كلمة مرور مؤقتة لك. يجب تغييرها قبل المتابعة.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              كلمة المرور الحالية (المؤقتة)
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 pe-10 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                disabled={isLoading}
              >
                {showCurrentPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              كلمة المرور الجديدة
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 pe-10 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                disabled={isLoading}
              >
                {showNewPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Strength Indicator */}
            {newPassword && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">قوة كلمة المرور:</span>
                  <span className={`font-medium ${passwordStrength.color.replace('bg-', 'text-')}`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${passwordStrength.color}`}
                    style={{ width: `${(passwordStrength.score + 1) * 20}%` }}
                  />
                </div>

                {/* Rules Checklist */}
                <div className="space-y-1.5 mt-3 text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    {passwordStrength.checks.length ? (
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                    <span className={passwordStrength.checks.length ? 'text-slate-700 dark:text-slate-300' : 'text-slate-500 dark:text-slate-400'}>
                      8 أحرف على الأقل
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    {passwordStrength.checks.hasNumber ? (
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                    <span className={passwordStrength.checks.hasNumber ? 'text-slate-700 dark:text-slate-300' : 'text-slate-500 dark:text-slate-400'}>
                      يحتوي على أرقام
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    {passwordStrength.checks.hasUpper ? (
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                    <span className={passwordStrength.checks.hasUpper ? 'text-slate-700 dark:text-slate-300' : 'text-slate-500 dark:text-slate-400'}>
                      يحتوي على حروف كبيرة
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    {passwordStrength.checks.hasSymbol ? (
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                    <span className={passwordStrength.checks.hasSymbol ? 'text-slate-700 dark:text-slate-300' : 'text-slate-500 dark:text-slate-400'}>
                      يحتوي على رموز (!@#$)
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              تأكيد كلمة المرور الجديدة
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full px-4 py-2 pe-10 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 ${
                  confirmPassword && !passwordsMatch
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-slate-300 dark:border-slate-600 focus:border-green-500 focus:ring-green-500/20'
                }`}
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {confirmPassword && !passwordsMatch && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                كلمتا المرور غير متطابقتين
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-700 dark:text-green-400">
                تم تغيير كلمة المرور بنجاح. جاري التحويل...
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!allFieldsFilled || isLoading}
            className="w-full py-2.5 px-4 bg-green-500 hover:bg-green-600 disabled:bg-slate-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                جاري معالجة الطلب...
              </>
            ) : (
              'تغيير كلمة المرور والمتابعة'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
