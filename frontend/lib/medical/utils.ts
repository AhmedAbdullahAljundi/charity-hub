import { MedicalRecord, EligibilityCheck, EligibilityStatus } from '@/types/medical'

const MONTHLY_LIMIT = 800 // الحد الأقصى للصرف الشهري
const SEASONAL_LIMIT = 400 // الحد الأقصى للصرف الموسمي
const CRITICAL_DISEASES = ['السرطان', 'أمراض القلب المزمنة', 'الفشل الكلوي', 'السكتة الدماغية']

export function calculateEligibility(record: MedicalRecord): EligibilityCheck {
  const conditions: { label: string; passed: boolean }[] = []

  // التحقق من نوع المرض
  const isCritical = CRITICAL_DISEASES.some(disease => record.disease.includes(disease))
  conditions.push({
    label: 'نوع المرض',
    passed: true,
  })

  // التحقق من المبلغ بناءً على نوع الصرف
  let isAmountValid = false
  if (record.disbursementType === 'شهري') {
    isAmountValid = record.treatmentCost <= MONTHLY_LIMIT
  } else if (record.disbursementType === 'موسمي') {
    isAmountValid = record.treatmentCost <= SEASONAL_LIMIT
  } else if (record.disbursementType === 'زواج') {
    isAmountValid = true
  }

  conditions.push({
    label: `حد الصرف (${record.disbursementType})`,
    passed: isAmountValid,
  })

  // التحقق من تاريخ الصرف السابق
  let enoughTimeElapsed = true
  if (record.lastDisbursementDate) {
    const lastDate = new Date(record.lastDisbursementDate)
    const currentDate = new Date(record.recordDate)
    const daysDiff = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))

    if (record.disbursementType === 'شهري') {
      enoughTimeElapsed = daysDiff >= 25
    } else if (record.disbursementType === 'موسمي') {
      enoughTimeElapsed = daysDiff >= 90
    }
  }

  conditions.push({
    label: 'تجاوز فترة الصرف السابق',
    passed: enoughTimeElapsed || !record.lastDisbursementDate,
  })

  // تحديد الحالة
  let status: EligibilityStatus = 'مقبول'
  let reason = 'مستوفي جميع الشروط'

  if (isCritical && !isAmountValid) {
    status = 'استثناء'
    reason = 'حالة حرجة تتطلب استثناء - تجاوز الحد المسموح به'
  } else if (!isAmountValid && !isCritical) {
    status = 'مرفوض'
    reason = `المبلغ يتجاوز الحد المسموح به للصرف ${record.disbursementType}`
  } else if (!enoughTimeElapsed && record.lastDisbursementDate) {
    status = 'قيد_المراجعة'
    reason = 'لم تنقضِ فترة كافية منذ آخر صرف'
  }

  return {
    isEligible: status === 'مقبول' || status === 'استثناء',
    status,
    reason,
    conditions,
  }
}

export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString('ar-SA')} ج.م`
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function getStatusColor(status: EligibilityStatus): string {
  switch (status) {
    case 'مقبول':
      return 'bg-green-100 text-green-800 border-green-300'
    case 'مرفوض':
      return 'bg-red-100 text-red-800 border-red-300'
    case 'قيد_المراجعة':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    case 'استثناء':
      return 'bg-purple-100 text-purple-800 border-purple-300'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}

export function getEligibilityColor(level: string): string {
  switch (level) {
    case 'eligible':
    case 'OK':
      return 'bg-green-100 text-green-800 border-green-300'
    case 'warning':
    case 'WARNING':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    case 'blocked':
    case 'BLOCKED':
      return 'bg-red-100 text-red-800 border-red-300'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}

export function getEligibilityLabel(level: string): string {
  switch (level) {
    case 'eligible':
    case 'OK':
      return 'مستحق'
    case 'warning':
    case 'WARNING':
      return 'تحذير'
    case 'blocked':
    case 'BLOCKED':
      return 'ممنوع'
    default:
      return 'غير محدد'
  }
}

export function getAgeCircleColor(age: number): string {
  if (age < 18) return 'bg-blue-100 text-blue-800 border-blue-300'
  if (age > 60) return 'bg-purple-100 text-purple-800 border-purple-300'
  return 'bg-gray-100 text-gray-800 border-gray-300'
}

export function getAgeGroupLabel(age: number): string {
  if (age < 18) return 'طفل'
  if (age > 60) return 'مسن'
  return 'بالغ'
}

export function getAidTypeLabel(type: string | null | undefined): string {
  switch (type) {
    case 'TREATMENT': return 'علاج'
    case 'LAB_TEST': return 'تحاليل'
    case 'IMAGING': return 'أشعة'
    case 'CONSULTATION': return 'كشف طبي'
    case 'SURGERY': return 'عملية جراحية'
    case 'MEDICATION': return 'أدوية'
    case 'EQUIPMENT': return 'أجهزة طبية'
    case 'FINANCIAL_AID': return 'مساعدة نقدية'
    case 'MARRIAGE_AID': return 'مساعدة زواج (استثناء)'
    default: return type || 'غير محدد'
  }
}

export function formatDateShort(dateStr: string | Date | undefined | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('ar-EG');
}
