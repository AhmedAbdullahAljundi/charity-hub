'use client'

import { Category, categoryLabels } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { CategoryBadge } from './category-badge'

interface CategoryBreakdownProps {
  categories: Category[]
}

export function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  const totalBudget = categories.reduce((sum, c) => sum + c.budget, 0)
  const totalSpent = categories.reduce((sum, c) => sum + c.spent, 0)

  const sortedCategories = [...categories].sort((a, b) => b.spent - a.spent)

  return (
    <Card className="sticky top-6 border border-slate-200 dark:border-slate-700 p-6">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">توزيع الفئات</h2>

      <div className="space-y-4">
        {sortedCategories.map((category) => {
          const percentUsed = (category.spent / category.budget) * 100
          const isOverBudget = category.spent > category.budget

          return (
            <div key={category.id} className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <CategoryBadge type={category.type as any} />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {Math.min(Math.round(percentUsed), 100)}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="relative h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    isOverBudget
                      ? 'bg-red-500'
                      : percentUsed > 80
                      ? 'bg-yellow-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(percentUsed, 100)}%` }}
                />
              </div>

              {/* Budget Stats */}
              <div className="flex justify-between items-end">
                <div className="text-xs">
                  <p className="text-slate-500 dark:text-slate-400">
                    {Math.round(category.spent).toLocaleString()} /{' '}
                    {Math.round(category.budget).toLocaleString()} ر.س
                  </p>
                </div>
                {isOverBudget && (
                  <span className="text-xs font-bold text-red-600">
                    تجاوز الحد: {Math.round(category.spent - category.budget).toLocaleString()} ر.س
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-600 dark:text-slate-400">إجمالي الميزانية</span>
          <span className="font-bold text-slate-900 dark:text-white">
            {Math.round(totalBudget).toLocaleString()} ر.س
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-600 dark:text-slate-400">المصروف</span>
          <span className="font-bold text-emerald-600">
            {Math.round(totalSpent).toLocaleString()} ر.س
          </span>
        </div>
        <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-200 dark:border-slate-700">
          <span className="text-slate-600 dark:text-slate-400">المتبقي</span>
          <span className={`font-bold ${totalBudget - totalSpent >= 0 ? 'text-slate-900 dark:text-white' : 'text-red-600'}`}>
            {Math.round(totalBudget - totalSpent).toLocaleString()} ر.س
          </span>
        </div>
      </div>
    </Card>
  )
}
