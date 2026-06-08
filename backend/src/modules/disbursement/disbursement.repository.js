/**
 * Disbursement Repository
 * All Prisma queries for the disbursement module.
 * No business logic — data access only.
 */

'use strict';

const prisma = require('../../config/prisma');

// ─── Household include for calculation ───────────────────────────────────────

const HOUSEHOLD_INCLUDE_FOR_CALC = {
  persons: {
    include: {
      diseases:     true,
      disabilities: true,
    },
  },
  incomeSources: true,
  scoreResults: {
    orderBy: { calculatedAt: 'desc' },
    take: 1,
  },
};

// ─── Month CRUD ───────────────────────────────────────────────────────────────

const disbursementRepository = {

  // ── Eligible households ────────────────────────────────────────────────────

  async findEligibleHouseholds() {
    // الأسر المستحقة (Cat 1-5, 7, 9, 10)
    const eligible = await prisma.household.findMany({
      where: {
        humanDecision:     'APPROVED',
        isDraft:         false,
        classificationTag: { not: null, notIn: ['6'] },
      },
      include: {
        persons:        { include: { diseases: true, disabilities: true } },
        incomeSources:  true,
        academicRecords: true,
        scoreResults:   { orderBy: { calculatedAt: 'desc' }, take: 1 },
      },
    });

    // فئة 6 — غير مستحقة بمتبرع
    const donorSponsored = await prisma.household.findMany({
      where: {
        classificationTag: '6',
        isDraft: false,
      },
      include: {
        persons:        { include: { diseases: true, disabilities: true } },
        incomeSources:  true,
        academicRecords: true,
        scoreResults:   { orderBy: { calculatedAt: 'desc' }, take: 1 },
      },
    });

    // الأسر المستحقة فقط تخضع لفلتر الـ score
    const filteredEligible = eligible.filter(h => {
      const latest = h.scoreResults?.[0];
      return latest && Number(latest.normalizedPercent) >= 20;
    });

    return [...filteredEligible, ...donorSponsored];
  },

  // ── Month operations ───────────────────────────────────────────────────────

  async createMonth(data) {
    return prisma.disbursementMonth.create({ data });
  },

  async findMonth(id) {
    return prisma.disbursementMonth.findUnique({
      where: { id },
      include: {
        payments: {
          include: {
            household: {
              select: { id: true, code: true, familyName: true },
            },
            audits: {
              orderBy: { createdAt: 'desc' },
              take: 5,
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        createdBy:  { select: { id: true, name: true } },
        lockedBy:   { select: { id: true, name: true } },
        reopenedBy: { select: { id: true, name: true } },
      },
    });
  },

  async findMonthByPeriod(period) {
    return prisma.disbursementMonth.findUnique({
      where: { period },
    });
  },

  async updateMonth(id, data) {
    return prisma.disbursementMonth.update({ where: { id }, data });
  },

  async listMonths({ skip = 0, take = 20, status } = {}) {
    const where = status ? { status } : {};
    const [months, total] = await Promise.all([
      prisma.disbursementMonth.findMany({
        where,
        orderBy: { period: 'desc' },
        skip,
        take,
        include: {
          createdBy: { select: { id: true, name: true } },
          _count:    { select: { payments: true } },
        },
      }),
      prisma.disbursementMonth.count({ where }),
    ]);
    return { months, total };
  },

  // ── Payment CRUD ───────────────────────────────────────────────────────────

  async createPayment(data) {
    return prisma.monthlyPayment.create({ data });
  },

  async createManyPayments(dataArray, tx) {
    const client = tx || prisma;
    // createMany doesn't support nested creates — use loop inside transaction
    return Promise.all(dataArray.map((d) => client.monthlyPayment.create({ data: d })));
  },

  async findPayment(id) {
    return prisma.monthlyPayment.findUnique({
      where: { id },
      include: {
        month:     { select: { id: true, status: true, period: true } },
        household: { select: { id: true, code: true, familyName: true } },
        adjustedBy:{ select: { id: true, name: true } },
      },
    });
  },

  async updatePayment(id, data) {
    return prisma.monthlyPayment.update({ where: { id }, data });
  },

  async deleteMonthPayments(monthId, tx) {
    const client = tx || prisma;
    return client.monthlyPayment.deleteMany({ where: { monthId } });
  },

  async getMonthPayments(monthId, { search, category, paymentStatus, skip = 0, take = 100 } = {}) {
    const where = { monthId };
    if (category && category !== 'all') where.category = category;
    if (paymentStatus === 'meeza_pending') where.meezaStatus = 'PENDING';
    if (paymentStatus === 'cash_pending')  where.cashStatus  = 'PENDING';

    const [payments, total] = await Promise.all([
      prisma.monthlyPayment.findMany({
        where,
        include: {
          household: { select: { id: true, code: true, familyName: true } },
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take,
      }),
      prisma.monthlyPayment.count({ where }),
    ]);
    return { payments, total };
  },

  // ── Audit ──────────────────────────────────────────────────────────────────

  async createAudit(data) {
    return prisma.paymentAudit.create({ data });
  },

  async createManyAudits(dataArray, tx) {
    const client = tx || prisma;
    return client.paymentAudit.createMany({ data: dataArray });
  },

  // ── Config ─────────────────────────────────────────────────────────────────

  async getCategoryConfigs() {
    return prisma.categoryConfig.findMany({
      where:   { active: true },
      orderBy: { code: 'asc' },
    });
  },

  async getAllCategoryConfigs() {
    return prisma.categoryConfig.findMany({ orderBy: { code: 'asc' } });
  },

  async updateCategoryConfig(code, data, updatedById) {
    return prisma.categoryConfig.update({
      where: { code },
      data:  { ...data, updatedById },
    });
  },

  async upsertCategoryConfig(data) {
    return prisma.categoryConfig.upsert({
      where:  { code: data.code },
      update: data,
      create: data,
    });
  },

  async getGrantConfigs() {
    return prisma.grantConfig.findMany({
      where:   { active: true },
      orderBy: { code: 'asc' },
    });
  },

  async getAllGrantConfigs() {
    return prisma.grantConfig.findMany({ orderBy: { code: 'asc' } });
  },

  async updateGrantConfig(code, data) {
    return prisma.grantConfig.update({ where: { code }, data });
  },

  async upsertGrantConfig(data) {
    return prisma.grantConfig.upsert({
      where:  { code: data.code },
      update: data,
      create: data,
    });
  },

  // ── External Contributions ─────────────────────────────────────────────────

  async createExternalContribution(data) {
    return prisma.externalContribution.create({ data });
  },

  async getExternalContributions(householdId, period) {
    // Match contributions for the same month
    const start = new Date(period);
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    return prisma.externalContribution.findMany({
      where: {
        householdId,
        period: { gte: start, lt: end },
      },
    });
  },

  // ── Payment status update ──────────────────────────────────────────────────

  async updatePaymentStatus(paymentId, { meezaStatus, cashStatus }, userId, tx) {
    const client = tx || prisma;
    const data   = {};
    if (meezaStatus) data.meezaStatus = meezaStatus;
    if (cashStatus)  data.cashStatus  = cashStatus;

    const [payment] = await Promise.all([
      client.monthlyPayment.update({ where: { id: paymentId }, data }),
      client.paymentAudit.create({
        data: {
          paymentId,
          triggeredBy: userId,
          triggerType: 'STATUS_CHANGE',
          meta: { meezaStatus, cashStatus },
        },
      }),
    ]);
    return payment;
  },
};

module.exports = disbursementRepository;
