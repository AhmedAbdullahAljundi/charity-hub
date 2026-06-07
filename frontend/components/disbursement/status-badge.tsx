'use client'

import { cn } from '@/lib/utils'
import type { MonthStatus } from '@/lib/disbursement/types'
import { MONTH_STATUS_CONFIG } from '@/lib/disbursement/types'

interface StatusBadgeProps {
  status: MonthStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = MONTH_STATUS_CONFIG[status] || { label: status, color: 'bg-slate-100 text-slate-600' }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.color,
        className,
      )}
    >
      {config.label}
    </span>
  )
}
