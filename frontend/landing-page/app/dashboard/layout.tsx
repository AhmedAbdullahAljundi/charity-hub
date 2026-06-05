'use client'

import { useAuthGuard } from '@/lib/hooks/useAuthGuard'
import { usePermission, useUser, useLogout } from '@/lib/hooks/usePermission'
import { LogOut, Settings, Menu, X, Clock } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import ForcePasswordChange from '@/components/ForcePasswordChange'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated } = useAuthGuard()
  const user = useUser()
  const logout = useLogout()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const isAdmin = usePermission('USER_READ')

  if (!isAuthenticated) {
    return null
  }

  // Show force password change screen if needed
  if (user?.mustChangePassword) {
    return <ForcePasswordChange />
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400'
      case 'SUPERVISOR':
        return 'bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400'
      case 'WORKER':
        return 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400'
      case 'VIEWER':
        return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
      default:
        return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
    }
  }

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      ADMIN: 'مدير النظام',
      SUPERVISOR: 'مشرف',
      WORKER: 'موظف إدخال',
      VIEWER: 'مستعرض',
    }
    return labels[role] || role
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 start-0 z-40 h-screen w-64 bg-white dark:bg-slate-800 border-e border-slate-200 dark:border-slate-700 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">CH</span>
              </div>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                CharityHub
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 py-2">
              Main
            </div>

            <Link
              href="/dashboard"
              className="w-full px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              لوحة التحكم
            </Link>

            <Link
              href="/dashboard/households"
              className="w-full px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              الأسر
            </Link>

            {/* Admin Section */}
            {isAdmin && (
              <>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 py-2 mt-4">
                  Administration
                </div>

                <Link
                  href="/dashboard/users"
                  className="w-full px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  إدارة المستخدمين
                </Link>

                <Link
                  href="/dashboard/admin/rules"
                  className="w-full px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  القواعس والإعدادات
                </Link>
              </>
            )}
          </nav>

          {/* User Profile */}
          <div className="border-t border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="md:ms-64 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-4">
            {/* Mobile Menu */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              {sidebarOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

            {/* Title */}
            <h1 className="flex-1 text-lg font-semibold text-slate-900 dark:text-slate-100 text-center md:text-start ms-4 md:ms-0">
              لوحة التحكم
            </h1>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Role Badge */}
              <div
                className={`hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${getRoleBadgeColor(user?.role || 'VIEWER')}`}
              >
                {getRoleLabel(user?.role || 'VIEWER')}
              </div>

              {/* Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold hover:bg-green-600 transition-colors"
                >
                  {user?.name?.charAt(0) || 'U'}
                </button>

                {profileOpen && (
                  <div className="absolute end-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50">
                    <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        مرحباً، {user?.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        دورك: {getRoleLabel(user?.role || 'VIEWER')}
                      </p>
                      {user?.lastLoginAt && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-slate-500 dark:text-slate-400">
                          <Clock className="w-3 h-3" />
                          آخر دخول:{' '}
                          {new Date(user.lastLoginAt).toLocaleDateString('ar')}
                        </div>
                      )}
                    </div>

                    <Link
                      href="/dashboard/account"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      <Settings className="w-4 h-4" />
                      إعدادات الحساب
                    </Link>

                    <button
                      onClick={() => {
                        logout()
                        window.location.href = '/login'
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      <LogOut className="w-4 h-4" />
                      تسجيل الخروج
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
