'use client'

import { GrantStatus, grantStatusLabels, grantStatusColors } from '@/lib/types'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: GrantStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const color = grantStatusColors[status]
  
  return (
    <span
      className={cn(
        'inline-block px-3 py-1 rounded-full text-xs font-medium',
        color.bg,
        color.text,
        className
      )}
    >
      {grantStatusLabels[status]}
    </span>
  )
}
