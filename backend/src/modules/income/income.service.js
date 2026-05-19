const prisma = require('../../config/prisma');
const { NotFoundError, ConflictError } = require('../../utils/errors');
const { assertHouseholdAccessById } = require('../../shared/householdAccess');
const { serializeIncomeSource } = require('../../shared/serializers');

const incomeService = {
  async create(user, householdId, body) {
    await assertHouseholdAccessById(user, householdId);
    try {
      const row = await prisma.incomeSource.create({
        data: {
          householdId,
          channel: body.channel,
          monthlyAmount: body.monthlyAmount,
          verified: body.verified || 'UNVERIFIED',
        },
      });
      return serializeIncomeSource(row);
    } catch (e) {
      if (e.code === 'P2002') throw new ConflictError('Income channel already exists for household');
      throw e;
    }
  },

  async update(user, householdId, incomeId, body) {
    await assertHouseholdAccessById(user, householdId);
    const existing = await prisma.incomeSource.findFirst({
      where: { id: incomeId, householdId },
    });
    if (!existing) throw new NotFoundError('IncomeSource');
    const row = await prisma.incomeSource.update({
      where: { id: incomeId },
      data: {
        monthlyAmount: body.monthlyAmount,
        verificationNote: body.verificationNote,
      },
    });
    return serializeIncomeSource(row);
  },

  async remove(user, householdId, incomeId) {
    await assertHouseholdAccessById(user, householdId);
    await prisma.incomeSource.deleteMany({ where: { id: incomeId, householdId } });
  },

  async verify(user, householdId, incomeId, body) {
    await assertHouseholdAccessById(user, householdId);
    const before = await prisma.incomeSource.findFirst({
      where: { id: incomeId, householdId },
    });
    if (!before) throw new NotFoundError('IncomeSource');
    const row = await prisma.incomeSource.update({
      where: { id: incomeId },
      data: {
        verified: body.verified || 'VERIFIED',
        verificationNote: body.verificationNote,
        verifiedAt: new Date(),
        verifiedById: user.userId,
      },
    });
    return { before, after: row };
  },
};

module.exports = incomeService;
