'use client'

import Link from 'next/link'
import { Month } from '@/lib/types'
import { ChevronLeft } from 'lucide-react'
import { formatPeriod } from '@/lib/utils-charity'

interface MonthsTableProps {
  months: Month[]
}

export function MonthsTable({ months }: MonthsTableProps) {
  if (months.length === 0) {
    return (
      <div className="p-12 text-center">
        <p className="text-slate-500 dark:text-slate-400">لا توجد دورات لعرضها</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 dark:text-slate-300 font-medium">الدورة</th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 dark:text-slate-300 font-medium">الحالة</th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 dark:text-slate-300 font-medium">الميزانية</th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 dark:text-slate-300 font-medium">المصروف</th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 dark:text-slate-300 font-medium">النسبة</th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 dark:text-slate-300 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {months.map((month) => {
            const spent = month.categories.reduce((sum, c) => sum + c.spent, 0)
            const percentage = Math.round((spent / month.totalBudget) * 100)

            return (
              <tr
                key={month.id}
                className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                  {formatPeriod(month.period)}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                      month.status === 'CALCULATED'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        : month.status === 'APPROVED'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : month.status === 'PLANNING'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-slate-100 text-slate-800 dark:bg-slate-700/30 dark:text-slate-300'
                    }`}
                  >
                    {month.status === 'CALCULATED' ? 'محسوب' : month.status === 'APPROVED' ? 'معتمد' : month.status === 'PLANNING' ? 'قيد التخطيط' : 'مؤرشف'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-medium">
                  {Math.round(month.totalBudget / 1000)}k ر.س
                </td>
                <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-medium">
                  {Math.round(spent / 1000)}k ر.س
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          percentage <= 50
                            ? 'bg-emerald-500'
                            : percentage <= 80
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-600 dark:text-slate-400 w-8">
                      {percentage}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/month/${month.id}`}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
