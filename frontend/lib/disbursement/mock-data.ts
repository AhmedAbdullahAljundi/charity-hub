export type MonthStatus = 'DRAFT' | 'CALCULATED' | 'APPROVED' | 'PAID'
export type FamilyCategory = string

export interface DisbursementFamily {
  id: string
  code: string
  name: string
  category: string
  vulnerabilityScore: number
  baseAmount: number
  incentives: number
  entitlement: number
  externalContributions: any[]
  externalTotal: number
  compensation: number
  manualAdjustment: number
  finalAmount: number
  meezaAmount: number
  meezaStatus: string
  cashAmount: number
  cashStatus: string
}

export interface DisbursementMonth {
  id: string
  period: string
  status: MonthStatus
  method: 'VULNERABILITY' | 'PROPORTIONAL'
  totalBudget: number
  familyCount: number
  totalDisbursed: number
  meezaTotal: number
  cashTotal: number
  families: DisbursementFamily[]
  createdAt: string
  approvedAt?: string
}

export interface CategorySettings {
  code: string
  nameAr: string
  capWithDeps: number
  capNoDeps: number
  maxAmount: number
  active: boolean
}

export interface GrantIncentive {
  code: string
  nameAr: string
  active: boolean
  type: 'MONTHLY' | 'ANNUAL' | 'PERIODIC'
  amount: number
  condition: string
}

// ─── helpers ────────────────────────────────────────────────────────────────

function rnd(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

const FAMILY_NAMES = [
  'الأحمد', 'الحسن', 'الخالد', 'السالم', 'العتيبي',
  'الدعيج', 'الهاجري', 'المطيري', 'الجابر', 'الشمري',
  'الحويطي', 'العنزي', 'المري', 'الزعبي', 'الضويان',
]

const INSTITUTIONS = [
  'مؤسسة النور', 'جمعية الخير', 'صندوق الرحمة', 'مؤسسة التكافل',
]

const CATEGORIES: FamilyCategory[] = [
  'أيتام', 'إعاقة', 'طالب علم', 'سجناء',
  'مساعدات', 'دعم خارجي', 'منفردون', 'مطلقات', 'مساكين',
]

function generateFamily(index: number, monthId: string): DisbursementFamily {
  const id = `${monthId}-family-${index}`
  const category = pick(CATEGORIES)
  const vulnerabilityScore = rnd(15, 98)
  const baseAmount = rnd(600, 2200)
  const incentives = pick([0, 0, 200, 300, 500])
  const entitlement = baseAmount + incentives

  const hasExternal = Math.random() > 0.65
  const externalContributions = hasExternal
    ? [
        {
          institutionName: pick(INSTITUTIONS),
          amount: rnd(200, 800),
          confirmed: Math.random() > 0.3,
        },
      ]
    : []
  const externalTotal = externalContributions.reduce((s, c) => s + c.amount, 0)
  const compensation = Math.max(0, entitlement - externalTotal)
  const manualAdjustment = pick([0, 0, 0, 100, -100, 200])
  const finalAmount = Math.max(0, compensation + manualAdjustment)
  const meezaAmount = Math.round(finalAmount * 0.35)
  const cashAmount = finalAmount - meezaAmount

  return {
    id,
    code: `REG${String(index).padStart(5, '0')}`,
    name: pick(FAMILY_NAMES),
    category,
    vulnerabilityScore,
    baseAmount,
    incentives,
    entitlement,
    externalContributions,
    externalTotal,
    compensation,
    manualAdjustment,
    finalAmount,
    meezaAmount,
    meezaStatus: pick(['PENDING', 'PAID', 'FAILED', 'PAID', 'PAID']),
    cashAmount,
    cashStatus: pick(['PENDING', 'PAID', 'PAID', 'PAID', 'FAILED']),
  }
}

function generateMonth(
  index: number,
  status: DisbursementMonth['status'],
): DisbursementMonth {
  const id = `disbursement-month-${index}`
  const date = new Date()
  date.setMonth(date.getMonth() - index)
  date.setDate(1)

  const familyCount = rnd(28, 52)
  const families = Array.from({ length: familyCount }, (_, i) =>
    generateFamily(i + 1, id),
  )

  const totalDisbursed = families.reduce((s, f) => s + f.finalAmount, 0)
  const meezaTotal = families.reduce((s, f) => s + f.meezaAmount, 0)
  const cashTotal = families.reduce((s, f) => s + f.cashAmount, 0)
  const totalBudget = Math.round(totalDisbursed * (1 + Math.random() * 0.15 + 0.05))

  return {
    id,
    period: date.toISOString(),
    status,
    method: pick(['VULNERABILITY', 'PROPORTIONAL']),
    totalBudget,
    familyCount,
    totalDisbursed,
    meezaTotal,
    cashTotal,
    families,
    createdAt: date.toISOString(),
    approvedAt:
      status === 'APPROVED' || status === 'PAID'
        ? new Date(date.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString()
        : undefined,
  }
}

// ─── mock data ──────────────────────────────────────────────────────────────

// Stable reference (no SSR re-generation on each render)
const STATUSES: DisbursementMonth['status'][] = [
  'CALCULATED',
  'APPROVED',
  'PAID',
  'PAID',
  'DRAFT',
]

function buildMockMonths(): DisbursementMonth[] {
  return STATUSES.map((status, i) => generateMonth(i, status))
}

// Export as a stable module-level constant
export const mockDisbursementMonths: DisbursementMonth[] = buildMockMonths()

// ─── settings mock data ──────────────────────────────────────────────────────

export const mockCategorySettings: CategorySettings[] = [
  { code: 'ORPHANS',   nameAr: 'أيتام',      capWithDeps: 1500, capNoDeps: 1200, maxAmount: 1800, active: true  },
  { code: 'DISABLED',  nameAr: 'إعاقة',      capWithDeps: 1400, capNoDeps: 1100, maxAmount: 1700, active: true  },
  { code: 'STUDENTS',  nameAr: 'طالب علم',   capWithDeps: 1200, capNoDeps: 1000, maxAmount: 1500, active: true  },
  { code: 'PRISONERS', nameAr: 'أسر سجناء',  capWithDeps: 900,  capNoDeps: 800,  maxAmount: 1100, active: true  },
  { code: 'ASSIST',    nameAr: 'مساعدات',    capWithDeps: 1100, capNoDeps: 900,  maxAmount: 1300, active: true  },
  { code: 'EXTERNAL',  nameAr: 'دعم خارجي',  capWithDeps: 1000, capNoDeps: 800,  maxAmount: 1200, active: false },
  { code: 'SINGLES',   nameAr: 'منفردون',    capWithDeps: 900,  capNoDeps: 800,  maxAmount: 1050, active: true  },
  { code: 'DIVORCED',  nameAr: 'مطلقات',     capWithDeps: 950,  capNoDeps: 820,  maxAmount: 1100, active: true  },
  { code: 'POOR',      nameAr: 'مساكين',     capWithDeps: 850,  capNoDeps: 750,  maxAmount: 1000, active: true  },
]

export const mockGrantIncentives: GrantIncentive[] = [
  { code: 'FUEL',      nameAr: 'مستحقات الوقود',    active: true,  type: 'MONTHLY',  amount: 200, condition: 'الأسرة صاحبة عمل' },
  { code: 'EDUCATION', nameAr: 'تعليم الأطفال',    active: true,  type: 'ANNUAL',   amount: 500, condition: 'وجود طالب علم' },
  { code: 'CLOTHING',  nameAr: 'ملابس الشتاء',     active: true,  type: 'ANNUAL',   amount: 300, condition: 'موسم الشتاء' },
  { code: 'HEALTH',    nameAr: 'مساعدة طبية',      active: false, type: 'PERIODIC', amount: 150, condition: 'وجود مرض مزمن' },
  { code: 'RAMADAN',   nameAr: 'مساعدة رمضان',     active: true,  type: 'ANNUAL',   amount: 400, condition: 'شهر رمضان' },
]
