// medical-eligibility.js
// ⚠️ هذا الملف يحتوي على قواعد الأهلية — لا تعدّل القيم مباشرة
// كل المعاملات مأخوذة من assistanceType وآخر تاريخ صرف

const COOLDOWN_DAYS = {
  MEDICAL_TREATMENT: 30,  // مساعدة طبية + أي نوع = 30 يوم
  DEFAULT: 40,            // باقي التصنيفات = 40 يوم
}

const CAPS = {
  MEDICAL_TREATMENT: 800,   // مساعدة طبية
  DEFAULT: 400,             // باقي التصنيفات
  CONSULTATION_DEFAULT: 200,// كشف طبي — القيمة الافتراضية
  MARRIAGE_AID_MAX: 70000,  // إعانة زواج
}

// التصنيفات التي تسمح بالاعانات الطبية
const ALLOWED_ASSISTANCE_TYPES = ['MONTHLY_CASH', 'MEDICAL', 'SEASONAL_INKIND']

/**
 * checkEligibility
 * @param {object} params
 * @param {string} params.assistanceType - من قرار اللجنة
 * @param {Date|null} params.lastDisbursementDate - تاريخ آخر اعانة أي نوع
 * @param {string} params.aidType - نوع الاعانة المطلوبة
 * @param {boolean} params.isCritical - هل الحالة حرجة
 * @param {boolean} params.hasPreviousMarriageAid - للزواج: هل سبق صرفها
 * @returns {object} EligibilityResult
 */
function checkEligibility({ assistanceType, lastDisbursementDate, aidType, isCritical, hasPreviousMarriageAid }) {
  // 1. فحص التصنيف — هل الأسرة مؤهلة أصلاً
  if (!ALLOWED_ASSISTANCE_TYPES.includes(assistanceType)) {
    return {
      isEligible: false,
      warningLevel: 'BLOCKED',
      message: 'هذه الأسرة غير مؤهلة للاعانات الطبية بناءً على تصنيف اللجنة',
      cooldownDays: 0,
      appliedCap: null,
      requiresSupervisor: false,
    }
  }

  // 2. إعانة الزواج — قواعد خاصة (لا cooldown، مرة واحدة)
  if (aidType === 'MARRIAGE_AID') {
    if (hasPreviousMarriageAid) {
      return {
        isEligible: false,
        warningLevel: 'BLOCKED',
        message: 'تم صرف إعانة الزواج لهذا الشخص مسبقاً — تُصرف مرة واحدة فقط',
        cooldownDays: 0,
        appliedCap: CAPS.MARRIAGE_AID_MAX,
        requiresSupervisor: false,
      }
    }
    return {
      isEligible: true,
      warningLevel: 'OK',
      message: null,
      cooldownDays: 0,
      appliedCap: CAPS.MARRIAGE_AID_MAX,
      requiresSupervisor: false,
    }
  }

  // 3. العملية — تحتاج مشرف دائماً (لكن مش blocked)
  const requiresSupervisor = aidType === 'SURGERY'

  // 4. حساب cooldown وفقاً للتصنيف
  const cooldownDays = assistanceType === 'MEDICAL'
    ? COOLDOWN_DAYS.MEDICAL_TREATMENT
    : COOLDOWN_DAYS.DEFAULT

  // 5. حساب السقف المطبق
  let appliedCap = assistanceType === 'MEDICAL' && aidType === 'TREATMENT'
    ? CAPS.MEDICAL_TREATMENT
    : CAPS.DEFAULT

  // 6. الحالة الحرجة تلغي السقف للعلاج فقط
  const isCriticalOverride = isCritical && aidType === 'TREATMENT'
  if (isCriticalOverride) appliedCap = null

  // 7. فحص الـ cooldown (مشترك بين كل الأنواع)
  if (!lastDisbursementDate) {
    return {
      isEligible: true,
      warningLevel: 'OK',
      message: null,
      cooldownDays,
      appliedCap,
      requiresSupervisor,
      isCriticalOverride,
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
      message: `لم تمر المدة المطلوبة — الاعانة التالية بعد ${remaining} يوم`,
      cooldownDays,
      nextEligibleDate: nextDate.toISOString().split('T')[0],
      remaining,
      appliedCap,
      requiresSupervisor,
      isCriticalOverride,
    }
  }

  return {
    isEligible: true,
    warningLevel: 'OK',
    message: null,
    cooldownDays,
    appliedCap,
    requiresSupervisor,
    isCriticalOverride,
  }
}

/**
 * validateAmount
 * @param {number} amount - المبلغ المطلوب
 * @param {object} eligibility - نتيجة checkEligibility
 * @returns {{ valid: boolean, warning: string|null }}
 */
function validateAmount(amount, eligibility) {
  if (!eligibility.appliedCap) return { valid: true, warning: null }
  if (amount > eligibility.appliedCap) {
    return {
      valid: false,
      warning: `قيمة الاعانة (${amount} ج.م.) تتجاوز الحد المسموح (${eligibility.appliedCap} ج.م.)`,
    }
  }
  return { valid: true, warning: null }
}

module.exports = { checkEligibility, validateAmount, CAPS, COOLDOWN_DAYS }
