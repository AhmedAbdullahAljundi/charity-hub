'use client'

import { Family } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye, Pencil, Building2 } from 'lucide-react'
import { formatAmount, getVulnerabilityColor } from '@/lib/utils-charity'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface EnhancedPaymentTableProps {
  families: Family[]
  isApproved: boolean
  onAdjustment: (familyId: string) => void
}

export function EnhancedPaymentTable({ families, isApproved, onAdjustment }: EnhancedPaymentTableProps) {
  if (families.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-12 text-center">
        <p className="text-slate-500 dark:text-slate-400">لا توجد أسر لعرضها</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
          <tr>
            <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-300">رقم القيد</th>
            <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-300">اسم الأسرة</th>
            <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-300">الفئة</th>
            <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-300">الهشاشة%</th>
            <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-300">القبض الأساسي</th>
            <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-300">الحوافز</th>
            <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-300">المستحق</th>
            <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-300">مساهمة خارجية</th>
            <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-300">التعويض</th>
            <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-300">الإجمالي</th>
            <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-300">ميزة</th>
            <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-300">نقدي</th>
            <th className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-300">⚙</th>
          </tr>
        </thead>
        <tbody>
          {families.map((family) => (
            <tr
              key={family.id}
              className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              {/* رقم القيد */}
              <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-300">{family.code}</td>

              {/* اسم الأسرة */}
              <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{family.name}</td>

              {/* الفئة */}
              <td className="px-4 py-3">
                <Badge variant="outline" className="text-xs">{family.category}</Badge>
              </td>

              {/* الهشاشة% */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-slate-300 dark:bg-slate-700 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${getVulnerabilityColor(family.vulnerabilityScore)}`}
                      style={{ width: `${family.vulnerabilityScore}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono">{family.vulnerabilityScore}%</span>
                </div>
              </td>

              {/* القبض الأساسي */}
              <td className="px-4 py-3 text-slate-900 dark:text-white">{formatAmount(family.calculatedAmount)}</td>

              {/* الحوافز */}
              <td className="px-4 py-3 text-slate-600 dark:text-slate-300">—</td>

              {/* المستحق */}
              <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{formatAmount(family.calculatedAmount)}</td>

              {/* مساهمة خارجية */}
              <td className="px-4 py-3">
                {family.externalTotal > 0 ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1 text-slate-400 text-sm cursor-help">
                        <Building2 className="h-3 w-3" />
                        <span>{formatAmount(family.externalTotal)}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>مؤسسة النور: {formatAmount(family.externalTotal * 0.6)}</p>
                      <p>جمعية الخير: {formatAmount(family.externalTotal * 0.4)}</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <span className="text-slate-600 dark:text-slate-400 text-xs">—</span>
                )}
              </td>

              {/* التعويض */}
              <td className="px-4 py-3">
                {family.compensationAmount < family.calculatedAmount ? (
                  <span className="text-green-400 font-semibold text-sm">↓ {formatAmount(family.compensationAmount)}</span>
                ) : (
                  <span className="text-slate-300 text-sm">{formatAmount(family.compensationAmount)}</span>
                )}
              </td>

              {/* الإجمالي */}
              <td className="px-4 py-3 font-bold text-white text-lg">
                {formatAmount(family.finalAmount)}
                {family.manualAdjustment !== 0 && (
                  <Badge variant="outline" className="bg-amber-500/20 border-amber-600 text-amber-400 text-xs ms-2">
                    معدّل
                  </Badge>
                )}
              </td>

              {/* ميزة */}
              <td className="px-4 py-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-mono">{formatAmount(family.meezaAmount)}</span>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      family.meezaStatus === 'PAID'
                        ? 'border-green-500 text-green-400'
                        : family.meezaStatus === 'FAILED'
                        ? 'border-red-500 text-red-400'
                        : 'border-slate-500 text-slate-400'
                    }`}
                  >
                    {family.meezaStatus === 'PAID' ? 'تم' : family.meezaStatus === 'FAILED' ? 'فشل' : 'معلق'}
                  </Badge>
                </div>
              </td>

              {/* نقدي */}
              <td className="px-4 py-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-mono">{formatAmount(family.cashAmount)}</span>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      family.cashStatus === 'PAID'
                        ? 'border-green-500 text-green-400'
                        : family.cashStatus === 'FAILED'
                        ? 'border-red-500 text-red-400'
                        : 'border-slate-500 text-slate-400'
                    }`}
                  >
                    {family.cashStatus === 'PAID' ? 'تم' : family.cashStatus === 'FAILED' ? 'فشل' : 'معلق'}
                  </Badge>
                </div>
              </td>

              {/* Actions */}
              <td className="px-4 py-3 text-center">
                <div className="flex gap-1 justify-center">
                  <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-slate-200 dark:hover:bg-slate-700">
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 hover:bg-slate-200 dark:hover:bg-slate-700"
                    disabled={isApproved}
                    onClick={() => onAdjustment(family.id)}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
