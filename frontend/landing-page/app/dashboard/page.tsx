'use client'

import { useAuthGuard } from '@/lib/hooks/useAuthGuard'

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthGuard()

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          مرحباً بك، {user?.name}
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          سعداء برؤيتك مرة أخرى. يمكنك البدء بإدارة الأسر والبيانات من هنا.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'إجمالي الأسر', value: '0', icon: '👥' },
          { label: 'قيد المراجعة', value: '0', icon: '⏳' },
          { label: 'مكتملة', value: '0', icon: '✅' },
        ].map((kpi, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{kpi.icon}</span>
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {kpi.label}
              </h3>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* Coming Soon */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-center">
        <p className="text-slate-600 dark:text-slate-400">
          <strong>Note:</strong> This is a frontend-only implementation. Connect your backend API at <code className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">/api/auth/login</code> and configure the API endpoints to enable full functionality.
        </p>
      </div>

      {/* Quick Links */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          روابط سريعة
        </h2>
        <div className="space-y-2">
          <a
            href="/dashboard/households"
            className="block px-4 py-2 text-green-600 dark:text-green-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            ← إضافة أسرة جديدة
          </a>
          <a
            href="/dashboard/users"
            className="block px-4 py-2 text-green-600 dark:text-green-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            ← إدارة المستخدمين (ADMIN فقط)
          </a>
        </div>
      </div>
    </div>
  )
}
