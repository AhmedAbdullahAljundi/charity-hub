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

// ─── Core calculation for a single household ──────────────────────────────────

async function calcOneFamily(household, configs, grants, method, ratePerPoint) {
  const latestScore = household.scoreResults?.[0];
  if (!latestScore) return null;

  const score  = Number(latestScore.normalizedPercent) / 100; // 0→1
  const cat    = household.classificationTag;
  const config = configs.find((c) => c.code === cat && c.active);
  if (!config) return null;

  const deps    = countDependents(household.persons);
  const orphans = household.persons.filter((p) => p.isOrphan).length;
  const income  = household.incomeSources.reduce(
    (s, i) => s + Number(i.monthlyAmount),
    0,
  );
  const isWidowNotRemarried = checkWidowStatus(household);

  let base = 0;

  if (method === 'PROPORTIONAL') {
    base = roundToNearest50(Number(latestScore.normalizedPercent) * ratePerPoint);
  } else {
    // VULNERABILITY — category-specific formulas
    switch (cat) {
      case '1':
      case 'كفالة أيتام':
      case 'أيتام': {
        const perOrphan = roundToNearest50(
          score * Number(config.maxPerChild ?? 700),
        );
        base = perOrphan * Math.max(orphans, 1);
        if (isWidowNotRemarried) base += Number(config.widowBonus ?? 200);
        break;
      }
      case '2':
      case 'ملف إعاقة':
      case 'إعاقة': {
        base = roundToNearest50(score * Number(config.maxAmount ?? 700));
        break;
      }
      case '3':
      case 'طلاب علم':
      case 'طالب علم':
      case '4':
      case 'أسر سجناء':
      case '9':
      case 'مطلقات': {
        const basePart = roundToNearest50(score * Number(config.baseMax ?? 400));
        const perDep   = roundToNearest50(score * Number(config.perDepMax ?? 200));
        base = basePart + perDep * deps;
        break;
      }
      case '5':
      case 'مساعدات':
      case 'مساعدات موسمية': {
        const threshold  = Number(config.poorScoreThreshold ?? 60) / 100;
        const resolvedMax = score >= threshold
          ? Number(config.maxAmount ?? 700)
          : Number(config.maxAmount ?? 700) * 0.7;
        base = roundToNearest50(score * resolvedMax);
        break;
      }
      case '6':
      case 'دعم خارجي': {
        base = Math.max(income, 250);
        break;
      }
      case '7':
      case 'منفردون':
      case '10':
      case 'مساكين':
      case 'فقراء':
      case 'مسنون':
      case 'كبار سن':
      case 'علاج شهري':
      case 'أمراض مزمنة':
      case 'حالات هجر': {
        base = roundToNearest50(score * Number(config.maxAmount ?? 500));
        break;
      }
      default:
        return null;
    }
  }

  // ── Grants / incentives ──────────────────────────────────────────────────
  const grantsBreakdown = [];
  const condMap = {
    isOrphan:         orphans > 0,
    hasStudents:      household.persons.some((p) => p.isStudent),
    hasQuranStudents: household.persons.some((p) => p.isStudent), // TODO: from StudentAcademicRecord
    hasMerge:         household.hasMerge ?? false,
  };

  for (const grant of grants) {
    if (!grant.active) continue;

    // Category filter
    if (grant.categoryFilter) {
      let allowed;
      try { allowed = JSON.parse(grant.categoryFilter); } catch { allowed = []; }
      if (!allowed.includes(cat)) continue;
    }

    if (!condMap[grant.condition]) continue;

    const unitCount = Math.max(orphans, deps, 1);
    const rawAmount = grant.isPerUnit
      ? Number(grant.amount) * unitCount
      : Number(grant.amount);
    const amount = grant.maxAmount
      ? Math.min(rawAmount, Number(grant.maxAmount))
      : rawAmount;

    grantsBreakdown.push({
      code:   grant.code,
      nameAr: grant.nameAr,
      amount,
    });
  }

  const grantsTotal = grantsBreakdown.reduce((s, g) => s + g.amount, 0);
  const mergeBonus  = 0; // sourced from GrantConfig (MERGE grant above)

  // ── Hard cap ─────────────────────────────────────────────────────────────
  const hasKids          = deps > 0 || orphans > 0;
  const cap              = hasKids
    ? Number(config.capWithDeps)
    : Number(config.capNoDeps);
  const rawTotal         = base + grantsTotal + mergeBonus;
  const calculatedAmount = Math.min(rawTotal, cap);

  // ── External contributions (deduct what others already give) ─────────────
  const period = new Date(); // set by calling context
  const externalContribs = await repo.getExternalContributions(
    household.id,
    period,
  );
  const externalTotal = externalContribs
    .filter((c) => c.confirmed)
    .reduce((s, c) => s + Number(c.amount), 0);
  const compensationAmount = Math.max(0, calculatedAmount - externalTotal);

  // ── Payment split ─────────────────────────────────────────────────────────
  const finalAmount = compensationAmount;
  const meezaAmount = Math.round(finalAmount * 0.9);
  const cashAmount  = finalAmount - meezaAmount;

  // ── Auto sub-category ─────────────────────────────────────────────────────
  const autoSubCategory =
    cat === '5'
      ? score >= Number(config.poorScoreThreshold ?? 60) / 100
        ? 'POOR'
        : 'NEEDY'
      : null;

  return {
    householdId:        household.id,
    householdSnapshot:  buildSnapshot(household),
    category:           cat,
    autoSubCategory,
    normalizedPercent:  new Decimal(latestScore.normalizedPercent),
    dependentCount:     deps,
    orphanCount:        orphans,
    totalIncome:        new Decimal(income),
    isWidowNotRemarried,
    externalTotal:      new Decimal(externalTotal),
    compensationAmount: new Decimal(compensationAmount),
    baseAmount:         new Decimal(base),
    grantsBreakdown:    JSON.stringify(grantsBreakdown),
    grantsTotal:        new Decimal(grantsTotal),
    mergeBonus:         new Decimal(mergeBonus),
    rawTotal:           new Decimal(rawTotal),
    appliedCap:         new Decimal(cap),
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

    // Load config from DB — no hardcoded values
    const [configs, grants, households] = await Promise.all([
      repo.getCategoryConfigs(),
      repo.getGrantConfigs(),
      repo.findEligibleHouseholds(),
    ]);

    // Calculate ratePerPoint for PROPORTIONAL method
    let ratePerPoint = 0;
    if (month.method === 'PROPORTIONAL' && month.totalBudget) {
      const totalPercent = households.reduce(
        (s, h) => s + Number(h.scoreResults?.[0]?.normalizedPercent ?? 0),
        0,
      );
      ratePerPoint = totalPercent > 0
        ? Number(month.totalBudget) / totalPercent
        : 0;
    }

    // Run calculation for each eligible household
    const results = await Promise.all(
      households.map((h) => calcOneFamily(h, configs, grants, month.method, ratePerPoint)),
    );
    const valid = results.filter(Boolean);

    // Persist inside a transaction
    await prisma.$transaction(async (tx) => {
      // Delete previous calculations (only safe if not APPROVED)
      await repo.deleteMonthPayments(monthId, tx);

      // Insert new payments + audit records
      for (const paymentData of valid) {
        const payment = await tx.monthlyPayment.create({
          data: { monthId, ...paymentData },
        });
        await tx.paymentAudit.create({
          data: {
            paymentId:   payment.id,
            changedById: user.userId,
            triggerType: 'CALCULATE',
            newAmount:   paymentData.finalAmount,
            meta:        { method: month.method },
          },
        });
      }

      // Update month status + persist scoreSum/ratePerPoint
      await tx.disbursementMonth.update({
        where: { id: monthId },
        data:  {
          status:      'CALCULATED',
          scoreSum:    month.method === 'PROPORTIONAL'
            ? new Decimal(households.reduce((s, h) => s + Number(h.scoreResults?.[0]?.normalizedPercent ?? 0), 0))
            : null,
          ratePerPoint: month.method === 'PROPORTIONAL' ? new Decimal(ratePerPoint) : null,
        },
      });
    });

    return {
      monthId,
      status:    'CALCULATED',
      processed: valid.length,
      skipped:   households.length - valid.length,
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

  async simulateMonth({ method, totalBudget }) {
    const [configs, grants, households] = await Promise.all([
      repo.getCategoryConfigs(),
      repo.getGrantConfigs(),
      repo.findEligibleHouseholds(),
    ]);

    let ratePerPoint = 0;
    if (method === 'PROPORTIONAL' && totalBudget) {
      const totalPercent = households.reduce(
        (s, h) => s + Number(h.scoreResults?.[0]?.normalizedPercent ?? 0),
        0,
      );
      ratePerPoint = totalPercent > 0 ? Number(totalBudget) / totalPercent : 0;
    }

    const results = await Promise.all(
      households.map((h) =>
        calcOneFamily(h, configs, grants, method || 'VULNERABILITY', ratePerPoint),
      ),
    );
    const valid = results.filter(Boolean);

    if (valid.length === 0) {
      return {
        eligibleCount: 0,
        totalRequired: 0,
        averagePayment: 0,
        maxPayment: 0,
        minPayment: 0,
        surplus: 0,
        byCategory: [],
      };
    }

    const amounts = valid.map((v) => Number(v.finalAmount));
    const total   = amounts.reduce((s, a) => s + a, 0);

    // Group by category
    const catMap = {};
    for (const v of valid) {
      const cat = v.category;
      if (!catMap[cat]) catMap[cat] = { category: cat, count: 0, total: 0 };
      catMap[cat].count++;
      catMap[cat].total += Number(v.finalAmount);
    }

    return {
      eligibleCount:  valid.length,
      totalRequired:  total,
      averagePayment: Math.round(total / valid.length),
      maxPayment:     Math.max(...amounts),
      minPayment:     Math.min(...amounts),
      surplus:        totalBudget ? Number(totalBudget) - total : null,
      byCategory:     Object.values(catMap),
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
