'use client'

import Link from 'next/link'
import { useLocale } from 'next-intl'
import { Eye, Download, CheckCircle, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/disbursement/status-badge'
import { formatPeriod, formatAmount } from '@/lib/disbursement/types'
import type { DisbursementMonth } from '@/lib/disbursement/types'

const METHOD_LABELS: Record<string, string> = {
  VULNERABILITY: 'حسب الهشاشة',
  PROPORTIONAL:  'نسبي',
  SCORE_BASED:   'حسب الدرجة',
}

interface MonthsTableProps {
  months: DisbursementMonth[]
  onApprove?: (id: string) => void
}

export function MonthsTable({ months, onApprove }: MonthsTableProps) {
  const locale = useLocale()

  if (months.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
          <span className="text-3xl">📋</span>
        </div>
        <p className="text-base font-medium text-slate-700 dark:text-slate-300">
          لا توجد شهور مفتوحة بعد
        </p>
        <p className="mt-1 text-sm text-slate-500">ابدأ بفتح شهر جديد لإدارة الصرف المالي</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400">
            <th className="px-5 py-3.5 text-start font-semibold text-xs tracking-wide">الشهر</th>
            <th className="px-5 py-3.5 text-start font-semibold text-xs tracking-wide">الطريقة</th>
            <th className="px-5 py-3.5 text-start font-semibold text-xs tracking-wide">عدد الأسر</th>
            <th className="px-5 py-3.5 text-start font-semibold text-xs tracking-wide">الميزانية</th>
            <th className="px-5 py-3.5 text-start font-semibold text-xs tracking-wide">الحالة</th>
            <th className="px-5 py-3.5 text-center font-semibold text-xs tracking-wide">إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {months.map((month, idx) => (
            <tr
              key={month.id}
              className={`border-b border-slate-100 dark:border-slate-700 transition-colors hover:bg-green-50/40 dark:hover:bg-green-900/10 ${
                idx % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50/20 dark:bg-slate-800/60'
              }`}
            >
              {/* الشهر */}
              <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-white">
                {formatPeriod(month.period)}
              </td>

              {/* الطريقة */}
              <td className="px-5 py-3.5">
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  month.method === 'VULNERABILITY'
                    ? 'bg-violet-100 text-violet-700'
                    : month.method === 'PROPORTIONAL'
                    ? 'bg-cyan-100 text-cyan-700'
                    : 'bg-indigo-100 text-indigo-700'
                }`}>
                  {METHOD_LABELS[month.method] ?? month.method}
                </span>
              </td>

              {/* عدد الأسر */}
              <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300">
                <span className="font-mono">{month._count?.payments ?? 0}</span> أسرة
              </td>

              {/* الميزانية */}
              <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300 font-mono">
                {month.totalBudget ? formatAmount(month.totalBudget) : '—'}
              </td>

              {/* الحالة */}
              <td className="px-5 py-3.5">
                <StatusBadge status={month.status} />
              </td>

              {/* إجراءات */}
              <td className="px-5 py-3.5">
                <div className="flex items-center justify-center gap-1">
                  {/* View */}
                  <Link href={`/${locale}/dashboard/disbursement/${month.id}`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700"
                      title="عرض التفاصيل"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>

                  {/* Export */}
                  {(month.status === 'APPROVED' || month.status === 'PAID') && (
                    <a
                      href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/disbursement/${month.id}/export/meeza`}
                      download
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700"
                        title="تصدير ميزة"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </a>
                  )}

                  {/* Approve */}
                  {month.status === 'CALCULATED' && onApprove && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                      title="اعتماد"
                      onClick={() => onApprove(month.id)}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}

                  {/* Lock icon for approved */}
                  {month.status === 'APPROVED' && (
                    <span className="flex h-8 w-8 items-center justify-center text-amber-500" title="معتمد ومقفل">
                      <Lock className="h-3.5 w-3.5" />
                    </span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
