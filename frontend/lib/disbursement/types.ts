// frontend/lib/disbursement/types.ts — canonical type definitions shared by store + components

export type MonthStatus = 'DRAFT' | 'CALCULATED' | 'APPROVED' | 'PAID'
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'CANCELLED'
export type DisbursementMethod = 'VULNERABILITY' | 'PROPORTIONAL'
export type FundSource = 'GENERAL' | 'ZAKAT' | 'SADAQA' | 'ORPHAN_FUND'
export type AutoSubCategory = 'POOR' | 'NEEDY' | null

export interface CategoryConfig {
  id: string
  code: string
  nameAr: string
  nameEn: string
  maxAmount?: string
  maxPerChild?: string
  widowBonus?: string
  baseMax?: string
  perDepMax?: string
  poorScoreThreshold?: string
  capWithDeps: string
  capNoDeps: string
  active: boolean
}

export interface GrantConfig {
  id: string
  code: string
  nameAr: string
  nameEn: string
  type: 'MONTHLY' | 'ANNUAL' | 'PERIODIC'
  amount: string
  isPerUnit: boolean
  maxAmount?: string
  condition: string
  categoryFilter?: string[]
  active: boolean
}

export interface DisbursementMonth {
  id: string
  period: string
  method: DisbursementMethod
  totalBudget?: string
  status: MonthStatus
  lockedAt?: string
  lockedById?: string
  reopenedAt?: string
  reopenReason?: string
  notes?: string
  createdAt: string
  _count?: { payments: number }
  payments?: MonthlyPayment[]
  createdBy?: { id: string; name: string }
  lockedBy?:  { id: string; name: string }
}

export interface ExternalContributionInfo {
  institutionName: string
  amount: string
  confirmed: boolean
}

export interface MonthlyPayment {
  id: string
  monthId: string
  householdId: string
  household: { id: string; code: string; familyName?: string }
  category: string
  autoSubCategory: AutoSubCategory
  normalizedPercent: string
  dependentCount: number
  orphanCount: number
  totalIncome: string
  baseAmount: string
  grantsBreakdown: { code: string; nameAr: string; amount: number }[]
  grantsTotal: string
  mergeBonus: string
  rawTotal: string
  appliedCap: string
  calculatedAmount: string
  externalTotal: string
  compensationAmount: string
  externalContributions?: ExternalContributionInfo[]
  manualAdjustment: string
  adjustmentReason?: string
  adjustedById?: string
  adjustedAt?: string
  finalAmount: string
  meezaAmount: string
  cashAmount: string
  meezaCardNumber?: string
  fundSource: FundSource
  meezaStatus: PaymentStatus
  cashStatus: PaymentStatus
  createdAt: string
}

export interface SimulateResult {
  eligibleCount: number
  totalRequired: number
  averagePayment: number
  maxPayment: number
  minPayment: number
  surplus?: number
  deficit?: number
  byCategory: { category: string; count: number; total: number }[]
}

// ─── Display constants ────────────────────────────────────────────────────────

export const CATEGORY_LABELS: Record<string, string> = {
  'كفالة أيتام': 'كفالة أيتام',
  'أيتام': 'أيتام',
  'ملف إعاقة': 'ملف إعاقة',
  'إعاقة': 'إعاقة',
  'طلاب علم': 'طلاب علم',
  'طالب علم': 'طالب علم',
  'أسر سجناء': 'أسر سجناء',
  'مساعدات': 'مساعدات',
  'مساعدات موسمية': 'مساعدات موسمية',
  'دعم خارجي': 'دعم خارجي',
  'منفردون': 'منفردون',
  'مطلقات': 'مطلقات',
  'مساكين': 'مساكين',
  'فقراء': 'فقراء',
  'مسنون': 'مسنون',
  'علاج شهري': 'علاج شهري',
  'أمراض مزمنة': 'أمراض مزمنة',
  'حالات هجر': 'حالات هجر',
  'كبار سن': 'كبار سن'
}

export const CATEGORY_COLORS: Record<string, string> = {
  'كفالة أيتام':  'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  'أيتام':  'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  'ملف إعاقة':  'bg-blue-100   text-blue-800   dark:bg-blue-900/30   dark:text-blue-300',
  'إعاقة':  'bg-blue-100   text-blue-800   dark:bg-blue-900/30   dark:text-blue-300',
  'طلاب علم':  'bg-sky-100    text-sky-800    dark:bg-sky-900/30    dark:text-sky-300',
  'طالب علم':  'bg-sky-100    text-sky-800    dark:bg-sky-900/30    dark:text-sky-300',
  'أسر سجناء':  'bg-slate-100  text-slate-700  dark:bg-slate-700     dark:text-slate-300',
  'مساعدات':  'bg-amber-100  text-amber-800  dark:bg-amber-900/30  dark:text-amber-300',
  'مساعدات موسمية': 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
  'دعم خارجي':  'bg-green-100  text-green-800  dark:bg-green-900/30  dark:text-green-300',
  'منفردون':  'bg-rose-100   text-rose-800   dark:bg-rose-900/30   dark:text-rose-300',
  'مطلقات':  'bg-pink-100   text-pink-800   dark:bg-pink-900/30   dark:text-pink-300',
  'مساكين': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  'فقراء': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  'مسنون': 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
  'علاج شهري': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  'أمراض مزمنة': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  'حالات هجر': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
  'كبار سن': 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300'
}

export const MONTH_STATUS_CONFIG: Record<MonthStatus, { label: string; color: string }> = {
  DRAFT:      { label: 'مسودة',  color: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' },
  CALCULATED: { label: 'محسوب', color: 'bg-blue-100  text-blue-700  dark:bg-blue-900/30 dark:text-blue-300' },
  APPROVED:   { label: 'معتمد', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  PAID:       { label: 'مصروف', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
}

export const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { label: string; dot: string }> = {
  PENDING:    { label: 'معلق',         dot: 'bg-slate-400'  },
  PROCESSING: { label: 'قيد التحويل', dot: 'bg-blue-400'   },
  PAID:       { label: 'تم',           dot: 'bg-green-500'  },
  FAILED:     { label: 'فشل',          dot: 'bg-red-500'    },
  CANCELLED:  { label: 'ملغي',         dot: 'bg-slate-500'  },
}

// ─── Formatting helpers ───────────────────────────────────────────────────────

export function formatAmount(value: string | number | undefined | null): string {
  if (value === undefined || value === null || value === '') return '—'
  return `${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.م`
}

export function formatPeriod(period: string): string {
  if (!period) return '—'
  return new Date(period).toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })
}
