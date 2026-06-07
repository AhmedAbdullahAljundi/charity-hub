// Charity-specific utility functions

export const formatPeriod = (period: string): string => {
  try {
    const date = new Date(period)
    return date.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })
  } catch {
    return period
  }
}

export const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0,
  }).format(amount)
}

export const getVulnerabilityColor = (score: number): string => {
  if (score >= 80) return 'bg-rose-500'
  if (score >= 60) return 'bg-orange-500'
  if (score >= 40) return 'bg-amber-500'
  if (score >= 20) return 'bg-blue-500'
  return 'bg-slate-400'
}

export const categoryLabelsAr: Record<string, string> = {
  ORPHANS: 'أيتام',
  DISABLED: 'إعاقة',
  STUDENTS: 'طالب علم',
  PRISONERS: 'سجناء',
  ASSISTANCE: 'مساعدات',
  EXTERNAL_SUPPORT: 'دعم خارجي',
  SINGLES: 'منفردون',
  DIVORCED: 'مطلقات',
  POOR: 'مساكين',
}

export const categoryColorMap: Record<string, string> = {
  ORPHANS: 'bg-red-500',
  DISABLED: 'bg-purple-500',
  STUDENTS: 'bg-blue-500',
  PRISONERS: 'bg-orange-500',
  ASSISTANCE: 'bg-green-500',
  EXTERNAL_SUPPORT: 'bg-cyan-500',
  SINGLES: 'bg-yellow-500',
  DIVORCED: 'bg-pink-500',
  POOR: 'bg-indigo-500',
}
