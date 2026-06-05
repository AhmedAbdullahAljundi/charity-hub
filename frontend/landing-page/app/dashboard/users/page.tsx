'use client'

import { useAuthGuard } from '@/lib/hooks/useAuthGuard'
import { usePermission } from '@/lib/hooks/usePermission'
import { Plus, Search, Edit2, AlertCircle, ChevronDown, Key } from 'lucide-react'
import { useState } from 'react'
import SetTempPasswordModal from '@/components/SetTempPasswordModal'

interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'SUPERVISOR' | 'WORKER' | 'VIEWER'
  active: boolean
  customPermissions?: string[]
  passwordResetRequest?: boolean
  passwordResetAt?: string
  createdAt: string
  lastLoginAt?: string
}

const PERMISSION_GROUPS: Record<string, { label: string; permissions: string[] }> = {
  households: {
    label: 'الأسر',
    permissions: ['HOUSEHOLD_READ', 'HOUSEHOLD_WRITE', 'HOUSEHOLD_DELETE', 'HOUSEHOLD_PUBLISH'],
  },
  scoring: {
    label: 'التقييم',
    permissions: ['SCORE_CALCULATE', 'SCORE_DECIDE', 'SCORE_SIMULATE', 'SCORE_READ'],
  },
  income: {
    label: 'الدخل',
    permissions: ['INCOME_WRITE', 'INCOME_VERIFY', 'INCOME_DELETE'],
  },
  data: {
    label: 'البيانات',
    permissions: [
      'EDUCATION_WRITE',
      'AUDIT_READ',
      'VERIFICATION_BULK',
      'PERSON_WRITE',
      'BURDEN_WRITE',
    ],
  },
}

const PERMISSION_LABELS: Record<string, string> = {
  HOUSEHOLD_READ: 'قراءة الأسر',
  HOUSEHOLD_WRITE: 'تعديل الأسر',
  HOUSEHOLD_DELETE: 'حذف الأسر',
  HOUSEHOLD_PUBLISH: 'نشر الأسر',
  SCORE_CALCULATE: 'حساب التقييم',
  SCORE_DECIDE: 'قرار اللجنة',
  SCORE_SIMULATE: 'المحاكاة',
  SCORE_READ: 'عرض التقييم',
  INCOME_WRITE: 'إدخال الدخل',
  INCOME_VERIFY: 'توثيق الدخل',
  INCOME_DELETE: 'حذف الدخل',
  EDUCATION_WRITE: 'إدارة التعليم',
  AUDIT_READ: 'سجل التدقيق',
  VERIFICATION_BULK: 'التوثيق الجماعي',
  PERSON_WRITE: 'تعديل الأفراد',
  BURDEN_WRITE: 'تعديل الأعباء',
}

export default function UsersPage() {
  const { isAuthenticated } = useAuthGuard(['ADMIN'])
  const canManageUsers = usePermission('USER_WRITE')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTab, setFilterTab] = useState<'all' | 'reset-requests'>('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedForReset, setSelectedForReset] = useState<User | null>(null)
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null)
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'محمد علي',
      email: 'admin@charityhub.org',
      role: 'ADMIN',
      active: true,
      customPermissions: [],
      passwordResetRequest: false,
      createdAt: '2025-01-01',
      lastLoginAt: '2025-06-05',
    },
    {
      id: '2',
      name: 'فاطمة أحمد',
      email: 'supervisor@charityhub.org',
      role: 'SUPERVISOR',
      active: true,
      customPermissions: [],
      passwordResetRequest: true,
      passwordResetAt: '2025-06-05T10:30:00Z',
      createdAt: '2025-01-15',
      lastLoginAt: '2025-06-04',
    },
    {
      id: '3',
      name: 'عمر سالم',
      email: 'worker@charityhub.org',
      role: 'WORKER',
      active: true,
      customPermissions: ['INCOME_VERIFY'],
      passwordResetRequest: false,
      createdAt: '2025-02-01',
      lastLoginAt: '2025-06-05',
    },
    {
      id: '4',
      name: 'سارة محمود',
      email: 'viewer@charityhub.org',
      role: 'VIEWER',
      active: false,
      customPermissions: [],
      passwordResetRequest: false,
      createdAt: '2025-03-10',
    },
  ])

  if (!isAuthenticated) {
    return null
  }

  if (!canManageUsers) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96">
        <p className="text-slate-600 dark:text-slate-400">
          ليس لديك صلاحية الوصول إلى هذه الصفحة
        </p>
      </div>
    )
  }

  const resetRequests = users.filter((u) => u.passwordResetRequest)
  const filteredUsers =
    filterTab === 'reset-requests'
      ? resetRequests
      : users.filter((u) =>
          u.name.includes(searchQuery) ||
          u.email.includes(searchQuery)
        )

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

  const activeCount = users.filter((u) => u.active).length
  const inactiveCount = users.filter((u) => !u.active).length

  const handleResetSuccess = (userId: string) => {
    setUsers(
      users.map((u) =>
        u.id === userId
          ? { ...u, passwordResetRequest: false, passwordResetAt: undefined }
          : u
      )
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            إدارة المستخدمين
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            إدارة حسابات وصلاحيات المستخدمين والطلبات المعلقة
          </p>
        </div>

        <button className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          إضافة مستخدم جديد
        </button>
      </div>

      {/* Alert Banner for Reset Requests */}
      {resetRequests.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
              {resetRequests.length} مستخدم طلب استعادة كلمة المرور
            </p>
            <button
              onClick={() => setFilterTab('reset-requests')}
              className="text-xs text-amber-700 dark:text-amber-300 hover:underline mt-1"
            >
              عرض الطلبات →
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 relative">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
            إجمالي المستخدمين
          </p>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            {users.length}
          </p>
          {resetRequests.length > 0 && (
            <div className="absolute -top-2 -end-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">{resetRequests.length}</span>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
            نشط
          </p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {activeCount}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
            معطل
          </p>
          <p className="text-3xl font-bold text-slate-600 dark:text-slate-400">
            {inactiveCount}
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="space-y-4">
        {/* Filter Tabs */}
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => {
              setFilterTab('all')
              setSearchQuery('')
            }}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              filterTab === 'all'
                ? 'border-green-500 text-green-600 dark:text-green-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            الكل
          </button>
          {resetRequests.length > 0 && (
            <button
              onClick={() => {
                setFilterTab('reset-requests')
                setSearchQuery('')
              }}
              className={`px-4 py-2 font-medium border-b-2 transition-colors flex items-center gap-2 ${
                filterTab === 'reset-requests'
                  ? 'border-green-500 text-green-600 dark:text-green-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              طلبات الاستعادة
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold">
                {resetRequests.length}
              </span>
            </button>
          )}
        </div>

        {/* Search */}
        {filterTab === 'all' && (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <div className="relative">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="ابحث عن مستخدم..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full ps-10 pe-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
              />
            </div>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                <th className="px-6 py-3 text-start text-sm font-semibold text-slate-900 dark:text-slate-100">
                  الاسم
                </th>
                <th className="px-6 py-3 text-start text-sm font-semibold text-slate-900 dark:text-slate-100">
                  البريد الإلكتروني
                </th>
                <th className="px-6 py-3 text-start text-sm font-semibold text-slate-900 dark:text-slate-100">
                  الدور
                </th>
                <th className="px-6 py-3 text-start text-sm font-semibold text-slate-900 dark:text-slate-100">
                  الحالة
                </th>
                <th className="px-6 py-3 text-start text-sm font-semibold text-slate-900 dark:text-slate-100">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className={`border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors ${
                    user.passwordResetRequest
                      ? 'bg-amber-50/50 dark:bg-amber-950/20'
                      : ''
                  }`}
                >
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {user.name}
                      </span>
                      {user.passwordResetRequest && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400">
                          <AlertCircle className="w-3 h-3" />
                          طلب استعادة
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}
                    >
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.active
                          ? 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {user.active ? 'نشط' : 'معطل'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {user.passwordResetRequest ? (
                        <button
                          onClick={() => setSelectedForReset(user)}
                          className="p-2 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/30 rounded-lg transition-colors"
                          title="تعيين كلمة مرور مؤقتة"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          title="تعديل الصلاحيات"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            {filterTab === 'reset-requests'
              ? 'لا توجد طلبات استعادة معلقة'
              : 'لا يوجد مستخدمين'}
          </div>
        )}
      </div>

      {/* Permissions Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-900">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                تعديل صلاحيات {selectedUser.name}
              </h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg p-2 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Role Info */}
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-900 dark:text-blue-300">
                  <strong>الدور:</strong> {getRoleLabel(selectedUser.role)}
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-400 mt-2">
                  الصلاحيات المخصصة تضاف فقط للصلاحيات المعطاة من قبل الدور.
                </p>
              </div>

              {/* Permission Groups */}
              <div className="space-y-4">
                {Object.entries(PERMISSION_GROUPS).map(([groupKey, group]) => (
                  <div
                    key={groupKey}
                    className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() =>
                        setExpandedGroup(
                          expandedGroup === groupKey ? null : groupKey
                        )
                      }
                      className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {group.label}
                      </h3>
                      <ChevronDown
                        className={`w-5 h-5 text-slate-600 dark:text-slate-300 transition-transform ${
                          expandedGroup === groupKey ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {expandedGroup === groupKey && (
                      <div className="p-4 space-y-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
                        {group.permissions.map((permission) => (
                          <label
                            key={permission}
                            className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded transition-colors"
                          >
                            <input
                              type="checkbox"
                              defaultChecked={selectedUser.customPermissions?.includes(
                                permission
                              )}
                              className="w-4 h-4 text-green-500 border-slate-300 rounded cursor-pointer"
                            />
                            <span className="text-sm text-slate-700 dark:text-slate-300">
                              {PERMISSION_LABELS[permission] || permission}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
                <button className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors">
                  حفظ التغييرات
                </button>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-medium rounded-lg transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Set Temp Password Modal */}
      {selectedForReset && (
        <SetTempPasswordModal
          user={selectedForReset}
          onClose={() => setSelectedForReset(null)}
          onSuccess={handleResetSuccess}
        />
      )}
    </div>
  )
}
