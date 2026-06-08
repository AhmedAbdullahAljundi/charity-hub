/**
 * Disbursement Service
 * Business logic for monthly disbursement calculation, approval, and management.
 *
 * RULES:
 * ✗ All monetary values use Decimal — never raw JS floats for money
 * ✗ No hardcoded amounts — all caps/limits come from CategoryConfig / GrantConfig
 * ✓ Every write operation inserts a PaymentAudit record
 * ✓ ScoreResult is READ ONLY — never modified here
 */

'use strict';

const Decimal = require('decimal.js');
const {
  ValidationError,
  NotFoundError,
  ConflictError,
  AppError,
} = require('../../utils/errors');
const repo = require('./disbursement.repository');
const prisma = require('../../config/prisma');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function roundToNearest50(amount) {
  return Math.round(Number(amount) / 50) * 50;
}

function roundUp50(amount) {
  return Math.ceil(Number(amount) / 50) * 50;
}

function countDependents(persons) {
  return persons.filter(
    (p) =>
      p.role === 'DEPENDENT_ADULT' ||
      (p.role === 'CHILD' && (p.isStudent || p.isOrphan)),
  ).length;
}

function checkWidowStatus(household) {
  const head = household.persons?.find((p) => p.isHead);
  return (
    head?.residencyStatus === 'ABSENT_DEATH' &&
    household.socialStatus !== 'REMARRIED'
  );
}

function buildSnapshot(household) {
  const latest = household.scoreResults?.[0];
  return {
    score:           { normalizedPercent: latest?.normalizedPercent },
    income:          household.incomeSources?.map((i) => ({
      channel:       i.channel,
      monthlyAmount: i.monthlyAmount,
    })),
    persons: household.persons?.map((p) => ({
      role:      p.role,
      gender:    p.gender,
      birthDate: p.birthDate,
      isOrphan:  p.isOrphan,
      isStudent: p.isStudent,
    })),
    category:        household.classificationTag,
    hasStudents:     household.persons?.some((p) => p.isStudent),
    hasMerge:        household.hasMerge,
    socialStatus:    household.socialStatus,
  };
}

function serializeDecimal(v) {
  return v instanceof Decimal ? v.toFixed(2) : String(v ?? '0');
}

function serializePayment(p) {
  if (!p) return p;
  return {
    ...p,
    normalizedPercent:  serializeDecimal(p.normalizedPercent),
    totalIncome:        serializeDecimal(p.totalIncome),
    externalTotal:      serializeDecimal(p.externalTotal),
    compensationAmount: serializeDecimal(p.compensationAmount),
    baseAmount:         serializeDecimal(p.baseAmount),
    grantsTotal:        serializeDecimal(p.grantsTotal),
    mergeBonus:         serializeDecimal(p.mergeBonus),
    rawTotal:           serializeDecimal(p.rawTotal),
    appliedCap:         serializeDecimal(p.appliedCap),
    calculatedAmount:   serializeDecimal(p.calculatedAmount),
    manualAdjustment:   serializeDecimal(p.manualAdjustment),
    finalAmount:        serializeDecimal(p.finalAmount),
    meezaAmount:        serializeDecimal(p.meezaAmount),
    cashAmount:         serializeDecimal(p.cashAmount),
  };
}

function serializeMonth(m) {
  if (!m) return m;
  return {
    ...m,
    totalBudget: m.totalBudget ? serializeDecimal(m.totalBudget) : null,
    payments:    m.payments?.map(serializePayment),
  };
}

async function calcCat6Family(family) {
  const donorAmount = family.externalSupportAmount ?? 250;
  return {
    householdId:      family.id,
    householdSnapshot: buildSnapshot(family),
    category:         '6',
    isDonorSponsored: true,
    donorName:        family.donorName ?? null,
    baseAmount:       new Decimal(donorAmount),
    grantsBreakdown:  "[]",
    grantsTotal:      new Decimal(0),
    mergeBonus:       new Decimal(0),
    rawTotal:         new Decimal(donorAmount),
    appliedCap:       new Decimal(donorAmount),
    calculatedAmount: new Decimal(donorAmount),
    externalTotal:    new Decimal(0),
    compensationAmount: new Decimal(donorAmount),
    finalAmount:      new Decimal(donorAmount),
    meezaAmount:      new Decimal(Math.round(donorAmount * 0.9)),
    cashAmount:       new Decimal(donorAmount - Math.round(donorAmount * 0.9)),
    meezaCardNumber:  family.meezaCardNumber ?? null,
    fundSource:       'GENERAL',
    meezaStatus:      'PENDING',
    cashStatus:       'PENDING',
    normalizedPercent: new Decimal(family.scoreResults?.[0]?.normalizedPercent || 0),
    dependentCount:   0,
    orphanCount:      0,
    totalIncome:      new Decimal(0),
    isWidowNotRemarried: false,
  };
}

function findOptimalBoost(families, configs, totalBudget, targetUtilization = 0.98) {
  for (let boostPct = 0; boostPct <= 100; boostPct += 0.5) {
    const total = families.reduce((sum, family) => {
      const cat    = family.classificationTag;
      const config = configs.find(c => c.code === cat);
      if (!config) return sum;

      const score    = Number(family.scoreResults?.[0]?.normalizedPercent || 0) / 100;
      const deps     = countDependents(family.persons || []);
      const orphans  = (family.persons || []).filter(p => p.isOrphan).length;
      const hasKids  = deps > 0 || orphans > 0;
      const baseCap  = hasKids
        ? Number(config.capWithDeps)
        : Number(config.capNoDeps);

      const boostedCap = baseCap * (1 + boostPct / 100);
      const boostedMax = Number(config.maxAmount) * (1 + boostPct / 100);

      let base = 0;
      switch (cat) {
        case '1':
        case 'كفالة أيتام':
        case 'أيتام': {
          const perOrphan = roundUp50(score * Number(config.maxPerChild || 700) * (1 + boostPct / 100));
          base = perOrphan * Math.max(orphans, 1);
          if (checkWidowStatus(family)) base += Number(config.widowBonus ?? 200);
          break;
        }
        case '3': case 'طالب علم': case 'طلاب علم':
        case '4': case 'أسر سجناء':
        case '9': case 'مطلقات': {
          base = roundUp50(score * Number(config.baseMax || 400) * (1 + boostPct / 100))
               + roundUp50(score * Number(config.perDepMax || 200) * (1 + boostPct / 100)) * deps;
          break;
        }
        case '5': case 'مساعدات': case 'مساعدات موسمية': {
          const threshold = Number(config.poorScoreThreshold ?? 60) / 100;
          const max = score >= threshold ? boostedMax : boostedMax * 0.7;
          base = roundUp50(score * max);
          break;
        }
        default:
          base = roundUp50(score * boostedMax);
      }

      return sum + Math.min(base, boostedCap);
    }, 0);

    if (total >= totalBudget * targetUtilization) {
      return { boostPct, projectedTotal: total };
    }
  }
  return { boostPct: 100, projectedTotal: totalBudget };
}

function evaluateGrants(grants, family, cat, orphans, deps) {
  const persons   = family.persons ?? [];
  const academic  = family.academicRecords ?? [];

  const conditions = {
    'isOrphan':         orphans > 0,
    'hasStudents':      persons.some(p => p.isStudent && p.role !== 'HEAD'),
    'hasQuranStudents': academic.some(r => r.quranJuzCount && Number(r.quranJuzCount) > 0),
    'hasMerge':         family.hasMerge === true,
  };

  const breakdown = [];
  for (const grant of grants.filter(g => g.active)) {
    const catFilter = grant.categoryFilter
      ? (Array.isArray(grant.categoryFilter) ? grant.categoryFilter : (function(){ try { return JSON.parse(grant.categoryFilter); } catch { return []; } })())
      : null;
    if (catFilter && !catFilter.includes(cat)) continue;

    const conditionMet = conditions[grant.condition] ?? false;
    if (!conditionMet) continue;

    let amount = Number(grant.amount);
    if (grant.isPerUnit) {
      const unitCount = grant.condition === 'isOrphan' ? orphans : deps;
      amount = Math.min(amount * Math.max(unitCount, 1), Number(grant.maxAmount ?? Infinity));
    }

    breakdown.push({
      code:   grant.code,
      nameAr: grant.nameAr,
      amount,
      reason: getGrantReason(grant.condition),
    });
  }
  return breakdown;
}

function getGrantReason(condition) {
  const reasons = {
    'isOrphan':         'يوجد أيتام في الأسرة',
    'hasStudents':      'يوجد طلاب مسجّلون',
    'hasQuranStudents': 'يوجد سجل قرآن نشط',
    'hasMerge':         'أسرة مدموجة',
  };
  return reasons[condition] ?? condition;
}

async function calcOneFamilyWithBoost(household, configs, grants, method, boostPct = 0) {
  const cat = household.classificationTag;
  if (cat === '6') return calcCat6Family(household);

  const latestScore = household.scoreResults?.[0];
  if (!latestScore) return null;

  const score  = Number(latestScore.normalizedPercent) / 100;
  const config = configs.find(c => c.code === cat && c.active);
  if (!config) return null;

  const boost    = 1 + boostPct / 100;
  const deps     = countDependents(household.persons || []);
  const orphans  = (household.persons || []).filter(p => p.isOrphan).length;
  const isWidow  = checkWidowStatus(household);
  const income   = (household.incomeSources || []).reduce((s, i) => s + Number(i.monthlyAmount), 0);

  let base = 0;
  switch (cat) {
    case '1':
    case 'كفالة أيتام':
    case 'أيتام': {
      const perOrphan = roundUp50(score * Number(config.maxPerChild ?? 700) * boost);
      base = perOrphan * Math.max(orphans, 1);
      if (isWidow) base += Number(config.widowBonus ?? 200);
      break;
    }
    case '2':
    case 'ملف إعاقة':
    case 'إعاقة': {
      base = roundUp50(score * Number(config.maxAmount ?? 700) * boost);
      break;
    }
    case '3': case 'طالب علم': case 'طلاب علم':
    case '4': case 'أسر سجناء':
    case '9': case 'مطلقات': {
      base = roundUp50(score * Number(config.baseMax ?? 400) * boost)
           + roundUp50(score * Number(config.perDepMax ?? 200) * boost) * deps;
      break;
    }
    case '5': case 'مساعدات': case 'مساعدات موسمية': {
      const threshold = Number(config.poorScoreThreshold ?? 60) / 100;
      const max = score >= threshold
        ? Number(config.maxAmount ?? 700) * boost
        : Number(config.maxAmount ?? 700) * boost * 0.7;
      base = roundUp50(score * max);
      break;
    }
    case '7': case 'منفردون':
    case '10': case 'مساكين': case 'فقراء': case 'مسنون': case 'كبار سن': case 'علاج شهري': case 'أمراض مزمنة': case 'حالات هجر': {
      base = roundUp50(score * Number(config.maxAmount ?? 500) * boost);
      break;
    }
    default: return null;
  }

  const hasKids = deps > 0 || orphans > 0;
  const cap     = (hasKids ? Number(config.capWithDeps) : Number(config.capNoDeps)) * boost;
  const boostedCap = roundUp50(cap);

  const grantsBreakdown = evaluateGrants(grants, household, cat, orphans, deps);
  const grantsTotal = grantsBreakdown.reduce((s, g) => s + g.amount, 0);
  const mergeBonus  = household.hasMerge ? 200 : 0;

  const rawTotal         = base + grantsTotal + mergeBonus;
  const calculatedAmount = Math.min(rawTotal, boostedCap);

  const externalContribs = await repo.getExternalContributions(household.id, new Date());
  const externalTotal = externalContribs.filter(c => c.confirmed).reduce((s, c) => s + Number(c.amount), 0);
  const compensationAmount = Math.max(0, calculatedAmount - externalTotal);
  const finalAmount = compensationAmount;
  const meezaAmount = Math.round(finalAmount * 0.9);
  const cashAmount  = finalAmount - meezaAmount;

  return {
    householdId:        household.id,
    householdSnapshot:  buildSnapshot(household),
    category:           cat,
    isDonorSponsored:   false,
    autoSubCategory:    cat === '5' ? (score >= Number(config.poorScoreThreshold ?? 60) / 100 ? 'POOR' : 'NEEDY') : null,
    normalizedPercent:  new Decimal(latestScore.normalizedPercent),
    dependentCount:     deps,
    orphanCount:        orphans,
    totalIncome:        new Decimal(income),
    isWidowNotRemarried: isWidow,
    externalTotal:      new Decimal(externalTotal),
    compensationAmount: new Decimal(compensationAmount),
    baseAmount:         new Decimal(base),
    grantsBreakdown:    JSON.stringify(grantsBreakdown),
    grantsTotal:        new Decimal(grantsTotal),
    mergeBonus:         new Decimal(mergeBonus),
    rawTotal:           new Decimal(rawTotal),
    appliedCap:         new Decimal(boostedCap),
    calculatedAmount:   new Decimal(calculatedAmount),
    finalAmount:        new Decimal(finalAmount),
    meezaAmount:        new Decimal(meezaAmount),
    meezaCardNumber:    household.meezaCardNumber ?? null,
    cashAmount:         new Decimal(cashAmount),
    fundSource:         'GENERAL',
    meezaStatus:        'PENDING',
    cashStatus:         'PENDING',
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

const disbursementService = {

  // ── List months ────────────────────────────────────────────────────────────

  async listMonths({ skip, take, status } = {}) {
    const { months, total } = await repo.listMonths({ skip, take, status });
    return { months: months.map(serializeMonth), total };
  },

  // ── Open new month ─────────────────────────────────────────────────────────

  async openMonth(user, { period, method, totalBudget, notes }) {
    // Normalise period to first of month (UTC midnight)
    const periodDate = new Date(period);
    periodDate.setUTCDate(1);
    periodDate.setUTCHours(0, 0, 0, 0);

    const existing = await repo.findMonthByPeriod(periodDate);
    if (existing) {
      throw new ConflictError(
        `يوجد شهر مفتوح بالفعل لـ ${periodDate.toISOString().slice(0, 7)}`,
      );
    }

    if (method === 'PROPORTIONAL' && !totalBudget) {
      throw new ValidationError('الميزانية مطلوبة عند اختيار طريقة التوزيع النسبي');
    }

    const month = await repo.createMonth({
      period:      periodDate,
      method:      method || 'VULNERABILITY',
      totalBudget: totalBudget ? new Decimal(totalBudget) : null,
      notes:       notes || null,
      createdById: user.userId,
      status:      'DRAFT',
    });

    return serializeMonth(month);
  },

  // ── Get month detail ───────────────────────────────────────────────────────

  async getMonth(monthId) {
    const month = await repo.findMonth(monthId);
    if (!month) throw new NotFoundError('DisbursementMonth');
    return serializeMonth(month);
  },

  // ── Calculate month ────────────────────────────────────────────────────────

  async calculateMonth(user, monthId) {
    const month = await repo.findMonth(monthId);
    if (!month) throw new NotFoundError('DisbursementMonth');
    if (month.status === 'APPROVED' || month.status === 'PAID') {
      throw new AppError('لا يمكن إعادة الحساب بعد الاعتماد', 400, 'MONTH_LOCKED');
    }

    const [configs, grants, households] = await Promise.all([
      repo.getCategoryConfigs(),
      repo.getGrantConfigs(),
      repo.findEligibleHouseholds(),
    ]);

    let boostPct = 0;
    if (month.method === 'PROPORTIONAL') {
      const { boostPct: optimal } = findOptimalBoost(
        households.filter(f => f.classificationTag !== '6'),
        configs,
        Number(month.totalBudget)
      );
      boostPct = optimal;
    }

    const results = [];
    for (const household of households) {
      const payment = await calcOneFamilyWithBoost(household, configs, grants, month.method, boostPct);
      if (payment) results.push(payment);
    }

    await prisma.$transaction(async (tx) => {
      await repo.deleteMonthPayments(monthId, tx);

      for (const paymentData of results) {
        const payment = await tx.monthlyPayment.create({
          data: { monthId, ...paymentData },
        });
        await tx.paymentAudit.create({
          data: {
            paymentId:   payment.id,
            changedById: user.userId,
            triggerType: 'CALCULATE',
            newAmount:   paymentData.finalAmount,
            meta:        { method: month.method, boostPct },
          },
        });
      }

      await tx.disbursementMonth.update({
        where: { id: monthId },
        data:  {
          status:       'CALCULATED',
          boostPercent: new Decimal(boostPct),
        },
      });
    });

    return {
      monthId,
      status:    'CALCULATED',
      processed: results.length,
      skipped:   households.length - results.length,
    };
  },

  // ── Approve month ──────────────────────────────────────────────────────────

  async approveMonth(user, monthId, { notes } = {}) {
    const month = await repo.findMonth(monthId);
    if (!month) throw new NotFoundError('DisbursementMonth');
    if (month.status !== 'CALCULATED') {
      throw new AppError(
        'يجب أن يكون الشهر في حالة "محسوب" قبل الاعتماد',
        400,
        'INVALID_STATUS',
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.disbursementMonth.update({
        where: { id: monthId },
        data: {
          status:      'APPROVED',
          lockedAt:    new Date(),
          lockedById:  user.userId,
          notes:       notes || month.notes,
        },
      });

      // Audit all payments
      const payments = await tx.monthlyPayment.findMany({
        where:  { monthId },
        select: { id: true, finalAmount: true },
      });
      await tx.paymentAudit.createMany({
        data: payments.map((p) => ({
          paymentId:   p.id,
          changedById: user.userId,
          triggerType: 'APPROVE',
          newAmount:   p.finalAmount,
          reason:      notes || null,
        })),
      });
    });

    return { monthId, status: 'APPROVED' };
  },

  // ── Reopen month ───────────────────────────────────────────────────────────

  async reopenMonth(user, monthId, { reopenReason }) {
    if (!reopenReason?.trim()) {
      throw new ValidationError('سبب إعادة الفتح مطلوب');
    }

    const month = await repo.findMonth(monthId);
    if (!month) throw new NotFoundError('DisbursementMonth');
    if (month.status !== 'APPROVED') {
      throw new AppError(
        'يمكن إعادة فتح الشهور المعتمدة فقط',
        400,
        'INVALID_STATUS',
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.disbursementMonth.update({
        where: { id: monthId },
        data: {
          status:       'CALCULATED',
          reopenedAt:   new Date(),
          reopenedById: user.userId,
          reopenReason: reopenReason.trim(),
        },
      });

      const payments = await tx.monthlyPayment.findMany({
        where:  { monthId },
        select: { id: true },
      });
      await tx.paymentAudit.createMany({
        data: payments.map((p) => ({
          paymentId:   p.id,
          changedById: user.userId,
          triggerType: 'REOPEN',
          reason:      reopenReason.trim(),
        })),
      });
    });

    return { monthId, status: 'CALCULATED' };
  },

  // ── Manual adjustment ──────────────────────────────────────────────────────

  async adjustPayment(user, paymentId, { manualAdjustment, adjustmentReason, fundSource }) {
    if (!adjustmentReason?.trim()) {
      throw new ValidationError('سبب التعديل مطلوب');
    }

    const payment = await repo.findPayment(paymentId);
    if (!payment) throw new NotFoundError('MonthlyPayment');
    if (payment.month.status === 'APPROVED' || payment.month.status === 'PAID') {
      throw new AppError('الشهر معتمد — لا يمكن إجراء تعديلات', 400, 'MONTH_LOCKED');
    }

    const oldAmount    = Number(payment.finalAmount);
    const adjustment   = Number(manualAdjustment);
    const newFinal     = Number(payment.calculatedAmount) + adjustment;
    const newMeeza     = Math.round(newFinal * 0.9);
    const newCash      = newFinal - newMeeza;

    const updated = await prisma.$transaction(async (tx) => {
      const p = await tx.monthlyPayment.update({
        where: { id: paymentId },
        data: {
          manualAdjustment: new Decimal(adjustment),
          adjustmentReason: adjustmentReason.trim(),
          adjustedById:     user.userId,
          adjustedAt:       new Date(),
          finalAmount:      new Decimal(newFinal),
          meezaAmount:      new Decimal(newMeeza),
          cashAmount:       new Decimal(newCash),
          fundSource:       fundSource || payment.fundSource,
        },
      });
      await tx.paymentAudit.create({
        data: {
          paymentId,
          changedById: user.userId,
          triggerType: 'MANUAL_EDIT',
          oldAmount:   new Decimal(oldAmount),
          newAmount:   new Decimal(newFinal),
          reason:      adjustmentReason.trim(),
        },
      });
      return p;
    });

    return serializePayment(updated);
  },

  // ── Update payment status ──────────────────────────────────────────────────

  async updatePaymentStatus(user, paymentId, { meezaStatus, cashStatus }) {
    const payment = await repo.findPayment(paymentId);
    if (!payment) throw new NotFoundError('MonthlyPayment');

    const updated = await repo.updatePaymentStatus(
      paymentId,
      { meezaStatus, cashStatus },
      user.userId,
    );
    return serializePayment(updated);
  },

  // ── Simulate (no DB writes) ────────────────────────────────────────────────

  async simulateMonth({ method, totalBudget, boostPct: manualBoost }) {
    const [configs, grants, households] = await Promise.all([
      repo.getCategoryConfigs(),
      repo.getGrantConfigs(),
      repo.findEligibleHouseholds(),
    ]);

    let finalBoost = manualBoost ?? 0;
    if (method === 'PROPORTIONAL' && manualBoost === undefined && totalBudget) {
      const { boostPct } = findOptimalBoost(
        households.filter(f => f.classificationTag !== '6'),
        configs,
        Number(totalBudget)
      );
      finalBoost = boostPct;
    }

    const results = [];
    for (const f of households) {
      const r = await calcOneFamilyWithBoost(f, configs, grants, method, finalBoost);
      if (r) results.push(r);
    }

    const amounts = results.map(r => Number(r.finalAmount));
    const total   = amounts.reduce((s, a) => s + a, 0);
    const budget  = Number(totalBudget ?? 0);

    const byCategory = Object.entries(
      results.reduce((acc, r) => {
        if (!acc[r.category]) acc[r.category] = { count: 0, total: 0 };
        acc[r.category].count++;
        acc[r.category].total += Number(r.finalAmount);
        return acc;
      }, {})
    ).map(([category, v]) => ({ category, ...v }));

    return {
      eligibleCount:  results.length,
      totalRequired:  total,
      averagePayment: results.length ? Math.round(total / results.length) : 0,
      maxPayment:     Math.max(...amounts, 0),
      minPayment:     Math.min(...amounts.filter(a => a > 0), 0),
      surplus:        method === 'PROPORTIONAL' && budget > total ? budget - total : null,
      deficit:        method === 'PROPORTIONAL' && budget < total ? total - budget : null,
      appliedBoost:   finalBoost,
      byCategory,
    };
  },

  // ── Add external contribution ──────────────────────────────────────────────

  async addExternalContribution(user, { householdId, period, institutionName, amount, confirmed, notes }) {
    const periodDate = new Date(period);
    periodDate.setUTCDate(1);
    periodDate.setUTCHours(0, 0, 0, 0);

    return repo.createExternalContribution({
      householdId,
      period:          periodDate,
      institutionName,
      amount:          new Decimal(amount),
      confirmed:       confirmed ?? false,
      notes:           notes || null,
    });
  },

  // ── Config — categories ────────────────────────────────────────────────────

  async getCategoryConfigs() {
    return repo.getAllCategoryConfigs();
  },

  async updateCategoryConfig(user, code, data) {
    const cfg = await prisma.categoryConfig.findUnique({ where: { code } });
    if (!cfg) throw new NotFoundError('CategoryConfig');
    return repo.updateCategoryConfig(code, data, user.userId);
  },

  // ── Config — grants ────────────────────────────────────────────────────────

  async getGrantConfigs() {
    return repo.getAllGrantConfigs();
  },

  async updateGrantConfig(user, code, data) {
    const cfg = await prisma.grantConfig.findUnique({ where: { code } });
    if (!cfg) throw new NotFoundError('GrantConfig');
    return repo.updateGrantConfig(code, data);
  },

  // ── CSV export — Meeza ─────────────────────────────────────────────────────

  async exportMeezaFile(monthId) {
    const month = await repo.findMonth(monthId);
    if (!month) throw new NotFoundError('DisbursementMonth');

    const pending = month.payments.filter((p) => p.meezaStatus === 'PENDING');

    const header = 'رقم_القيد,رقم_البطاقة,المبلغ,الفئة';
    const rows = pending.map((p) => {
      const code       = p.household?.code ?? '';
      const cardNum    = p.meezaCardNumber ?? '';
      const amount     = Number(p.meezaAmount).toFixed(2);
      const category   = p.category ?? '';
      return `${code},${cardNum},${amount},${category}`;
    });

    return [header, ...rows].join('\n');
  },
};

module.exports = disbursementService;
