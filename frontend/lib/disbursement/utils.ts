import type { MonthStatus, PaymentStatus } from './types'

export const statusLabel: Record<MonthStatus, string> = {
  DRAFT:      'مسودة',
  CALCULATED: 'محسوب',
  APPROVED:   'معتمد',
  PAID:       'مصروف',
}

export const paymentStatusLabel: Record<PaymentStatus, string> = {
  PENDING:    'معلق',
  PROCESSING: 'قيد التحويل',
  PAID:       'تم',
  FAILED:     'فشل',
  CANCELLED:  'ملغي',
}

