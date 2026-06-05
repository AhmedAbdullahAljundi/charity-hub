'use client'

import { useAuthGuard } from '@/lib/hooks/useAuthGuard'
import { usePermission, useUser } from '@/lib/hooks/usePermission'
import { Plus, Search, Edit2, Trash2, Eye } from 'lucide-react'
import { useState } from 'react'

export default function HouseholdsPage() {
  const { isAuthenticated } = useAuthGuard()
  const user = useUser()
  const canWrite = usePermission('HOUSEHOLD_WRITE')
  const canDelete = usePermission('HOUSEHOLD_DELETE')
  const [searchQuery, setSearchQuery] = useState('')

  if (!isAuthenticated) {
    return null
  }

  const mockHouseholds = [
    {
      id: '1',
      name: 'أسرة محمد علي',
      primaryPhone: '01xxxxxxxxxx',
      membersCount: 5,
      status: 'pending',
      score: 75,
    },
    {
      id: '2',
      name: 'أسرة فاطمة أحمد',
      primaryPhone: '01xxxxxxxxxx',
      membersCount: 3,
      status: 'approved',
      score: 88,
    },
    {
      id: '3',
      name: 'أسرة عمر سالم',
      primaryPhone: '01xxxxxxxxxx',
      membersCount: 4,
      status: 'pending',
      score: 62,
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400'
      case 'approved':
        return 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400'
      case 'rejected':
        return 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400'
      default:
        return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'قيد المراجعة',
      approved: 'موافق عليها',
      rejected: 'مرفوضة',
    }
    return labels[status] || status
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            الأسر
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            إدارة بيانات الأسر والمساعدات
          </p>
        </div>

        {canWrite && (
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            إضافة أسرة جديدة
          </button>
        )}
      </div>

      {/* Search & Filter */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="ابحث عن أسرة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full ps-10 pe-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
          />
        </div>
      </div>

      {/* Households Table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                <th className="px-6 py-3 text-start text-sm font-semibold text-slate-900 dark:text-slate-100">
                  الاسم
                </th>
                <th className="px-6 py-3 text-start text-sm font-semibold text-slate-900 dark:text-slate-100">
                  عدد الأفراد
                </th>
                <th className="px-6 py-3 text-start text-sm font-semibold text-slate-900 dark:text-slate-100">
                  الحالة
                </th>
                <th className="px-6 py-3 text-start text-sm font-semibold text-slate-900 dark:text-slate-100">
                  النقاط
                </th>
                <th className="px-6 py-3 text-start text-sm font-semibold text-slate-900 dark:text-slate-100">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody>
              {mockHouseholds.map((household) => (
                <tr
                  key={household.id}
                  className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100">
                    {household.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    {household.membersCount}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(household.status)}`}
                    >
                      {getStatusLabel(household.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100 font-medium">
                    {household.score}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      {canWrite && (
                        <button className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {canDelete && (
                        <button className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {mockHouseholds.length === 0 && (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            لا توجد أسر للعرض
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          <strong>Note:</strong> This shows mock data. Connect to your backend API to fetch real households data.
        </p>
      </div>
    </div>
  )
}
