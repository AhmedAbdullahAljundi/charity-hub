'use client'

import { cn } from '@/lib/utils'
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/lib/disbursement/types'

interface CategoryBadgeProps {
  category: string
  className?: string
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const color = CATEGORY_COLORS[category] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
  const label = CATEGORY_LABELS[category] || category

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        color,
        className,
      )}
    >
      {label}
    </span>
  )
}
