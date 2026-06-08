const COOLDOWN_DAYS = {
  MONTHLY_MEDICAL: 30,
  DEFAULT: 40,
}

const CAPS = {
  MONTHLY_MEDICAL_TREATMENT: 800,
  DEFAULT_TREATMENT: 400,
  MARRIAGE_AID_ORPHAN: 70000,
  MARRIAGE_AID_NON_ORPHAN: 30000,
  PERCENTAGE_WARNING_AMOUNT: 2000,
}

const ALLOWED_ASSISTANCE_TYPES = ['MONTHLY_MEDICAL', 'MONTHLY_CASH', 'SEASONAL_MIXED']
const PERCENTAGE_BASED_AID_TYPES = new Set(['SURGERY', 'FINANCIAL_AID'])

function asNumber(value, fallback = 0) {
  if (value === null || value === undefined || value === '') return fallback
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function getMarriageAidCap(isOrphan) {
  return isOrphan ? CAPS.MARRIAGE_AID_ORPHAN : CAPS.MARRIAGE_AID_NON_ORPHAN
}

function getTreatmentCap(assistanceType) {
  return assistanceType === 'MONTHLY_MEDICAL'
    ? CAPS.MONTHLY_MEDICAL_TREATMENT
    : CAPS.DEFAULT_TREATMENT
}

function buildPercentageWarning({ aidType, amount, totalCost, normalizedPercent }) {
  if (!PERCENTAGE_BASED_AID_TYPES.has(aidType)) return null

  const amountValue = asNumber(amount)
  const totalCostValue = asNumber(totalCost)
  const percentValue = asNumber(normalizedPercent)
  const entitlementAmount = totalCostValue > 0 && percentValue > 0
    ? totalCostValue * (percentValue / 100)
    : amountValue

  if (entitlementAmount <= CAPS.PERCENTAGE_WARNING_AMOUNT) return null

  return `قيمة الإعانة حسب نسبة استحقاق الأسرة (${Math.round(entitlementAmount)} ج.م) تتجاوز 2000 ج.م وتحتاج مراجعة.`
}

function checkEligibility({
  assistanceType,
  lastDisbursementDate,
  aidType,
  isCritical,
  hasPreviousMarriageAid,
  isOrphan,
  normalizedPercent,
  amount,
  totalCost,
}) {
  if (!ALLOWED_ASSISTANCE_TYPES.includes(assistanceType)) {
    return {
      isEligible: false,
      warningLevel: 'BLOCKED',
      message: 'هذه الأسرة غير مؤهلة للإعانات الطبية بناء على تصنيف اللجنة.',
      cooldownDays: 0,
      appliedCap: null,
      requiresSupervisor: false,
      percentageWarning: null,
    }
  }

  if (aidType === 'MARRIAGE_AID') {
    const appliedCap = getMarriageAidCap(Boolean(isOrphan))
    if (hasPreviousMarriageAid) {
      return {
        isEligible: false,
        warningLevel: 'BLOCKED',
        message: 'تم صرف إعانة الزواج لهذا الشخص مسبقا، وتصرف مرة واحدة فقط.',
        cooldownDays: 0,
        appliedCap,
        requiresSupervisor: false,
        percentageWarning: null,
      }
    }

    return {
      isEligible: true,
      warningLevel: 'OK',
      message: null,
      cooldownDays: 0,
      appliedCap,
      requiresSupervisor: false,
      percentageWarning: null,
    }
  }

  const cooldownDays = assistanceType === 'MONTHLY_MEDICAL'
    ? COOLDOWN_DAYS.MONTHLY_MEDICAL
    : COOLDOWN_DAYS.DEFAULT

  let appliedCap = aidType === 'TREATMENT' ? getTreatmentCap(assistanceType) : null
  const isCriticalOverride = Boolean(isCritical) && aidType === 'TREATMENT'
  if (isCriticalOverride) appliedCap = null

  const percentageWarning = buildPercentageWarning({
    aidType,
    amount,
    totalCost,
    normalizedPercent,
  })

  const requiresSupervisor = Boolean(isCritical)

  if (!lastDisbursementDate) {
    return {
      isEligible: true,
      warningLevel: percentageWarning ? 'WARNING' : 'OK',
      message: percentageWarning,
      cooldownDays,
      appliedCap,
      requiresSupervisor,
      isCriticalOverride,
      percentageWarning,
    }
  }

  const now = new Date()
  const last = new Date(lastDisbursementDate)
  const daysPassed = Math.floor((now - last) / (1000 * 60 * 60 * 24))

  if (daysPassed < cooldownDays) {
    const remaining = cooldownDays - daysPassed
    const nextDate = new Date(last.getTime() + cooldownDays * 24 * 60 * 60 * 1000)
    return {
      isEligible: false,
      warningLevel: 'WARNING',
      message: `لم تمر المدة المطلوبة، الإعانة التالية بعد ${remaining} يوم.`,
      cooldownDays,
      nextEligibleDate: nextDate.toISOString().split('T')[0],
      remaining,
      appliedCap,
      requiresSupervisor,
      isCriticalOverride,
      percentageWarning,
    }
  }

  return {
    isEligible: true,
    warningLevel: percentageWarning ? 'WARNING' : 'OK',
    message: percentageWarning,
    cooldownDays,
    appliedCap,
    requiresSupervisor,
    isCriticalOverride,
    percentageWarning,
  }
}

function validateAmount(amount, eligibility) {
  if (!eligibility.appliedCap) return { valid: true, warning: null }

  const amountValue = asNumber(amount)
  if (amountValue > eligibility.appliedCap) {
    return {
      valid: false,
      warning: `قيمة الإعانة (${amountValue} ج.م) تتجاوز الحد المسموح (${eligibility.appliedCap} ج.م).`,
    }
  }

  return { valid: true, warning: null }
}

module.exports = {
  checkEligibility,
  validateAmount,
  CAPS,
  COOLDOWN_DAYS,
  ALLOWED_ASSISTANCE_TYPES,
}
