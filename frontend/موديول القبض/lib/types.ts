export type CategoryType = 'FOOD' | 'SHELTER' | 'MEDICAL' | 'EDUCATION' | 'CLOTHING' | 'UTILITIES' | 'OTHER'

export const categoryLabels: Record<CategoryType, string> = {
  FOOD: 'غذاء',
  SHELTER: 'مأوى',
  MEDICAL: 'طبي',
  EDUCATION: 'تعليم',
  CLOTHING: 'ملابس',
  UTILITIES: 'مرافق',
  OTHER: 'أخرى',
}

export const categoryColors: Record<CategoryType, { bg: string; text: string; border: string }> = {
  FOOD: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
  SHELTER: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
  MEDICAL: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
  EDUCATION: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
  CLOTHING: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
  UTILITIES: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
  OTHER: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
}

export type GrantStatus = 'APPROVED' | 'PENDING' | 'REJECTED' | 'PAID'

export const grantStatusLabels: Record<GrantStatus, string> = {
  APPROVED: 'موافق',
  PENDING: 'قيد المراجعة',
  REJECTED: 'مرفوض',
  PAID: 'مدفوع',
}

export const grantStatusColors: Record<GrantStatus, { bg: string; text: string }> = {
  APPROVED: { bg: 'bg-green-100', text: 'text-green-700' },
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  REJECTED: { bg: 'bg-red-100', text: 'text-red-700' },
  PAID: { bg: 'bg-blue-100', text: 'text-blue-700' },
}

export interface Category {
  id: string
  name: string
  type: CategoryType
  budget: number
  spent: number
  limit?: number
}

export interface Grant {
  id: string
  familyId: string
  categoryId: string
  amount: number
  date: string
  status: GrantStatus
  notes?: string
}

export interface Family {
  id: string
  code: string // رقم القيد
  name: string
  headOfHousehold: string
  familySize: number
  monthlyIncome: number
  totalGrants: number
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  category: string // فئة (أيتام، إعاقة، إلخ)
  vulnerabilityScore: number // 0-100
  calculatedAmount: number // المستحق (المحسوب)
  externalTotal: number // مساهمة خارجية
  compensationAmount: number // التعويض (ما نحسبه)
  manualAdjustment: number // تعديل يدوي
  finalAmount: number // الإجمالي النهائي
  meezaAmount: number // مبلغ ميزة
  meezaStatus: 'PENDING' | 'PAID' | 'FAILED'
  cashAmount: number // مبلغ نقدي
  cashStatus: 'PENDING' | 'PAID' | 'FAILED'
  address?: string
  phone?: string
  notes?: string
  grants: Grant[]
}

export interface Month {
  id: string
  name: string
  year: number
  month: number
  date: string
  period: string // ISO date string for formatting
  status: 'PLANNING' | 'CALCULATED' | 'APPROVED' | 'ARCHIVED'
  method: 'VULNERABILITY' | 'PROPORTIONAL' // calculation method
  totalBudget: number
  categories: Category[]
  families: Family[]
  createdAt: string
}

export interface VulnerabilityMetrics {
  monthId: string
  familiesServed: number
  totalGrantsApproved: number
  totalGrantsPending: number
  totalGrantsRejected: number
  totalSpent: number
  budgetRemaining: number
  categoryDistribution: Record<CategoryType, number>
}

export interface DashboardSettings {
  id: string
  organizationName: string
  organizationLogo?: string
  defaultBudget: number
  currencySymbol: string
  requireApprovalForGrants: boolean
  maxFamilyGrantAmount: number
  approvalRequired: boolean
  users: User[]
  lastUpdated: string
}

export interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'MODERATOR' | 'VIEWER'
  createdAt: string
}
