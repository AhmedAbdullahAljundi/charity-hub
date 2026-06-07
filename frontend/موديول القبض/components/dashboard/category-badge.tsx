'use client'

import { CategoryType, categoryLabels, categoryColors } from '@/lib/types'
import { cn } from '@/lib/utils'

interface CategoryBadgeProps {
  type: CategoryType
  className?: string
}

export function CategoryBadge({ type, className }: CategoryBadgeProps) {
  const color = categoryColors[type]
  
  return (
    <span
      className={cn(
        'inline-block px-3 py-1 rounded-full text-xs font-medium border',
        color.bg,
        color.text,
        color.border,
        className
      )}
    >
      {categoryLabels[type]}
    </span>
  )
}
