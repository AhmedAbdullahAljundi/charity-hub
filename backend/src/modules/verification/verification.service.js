const prisma = require('../../config/prisma');
const { logFieldChanges } = require('../../shared/audit/auditLogger');

const verificationService = {
  async list(query) {
    const where = {};
    if (query.status) where.verified = query.status;
    if (query.channel) where.channel = query.channel;

   return prisma.incomeSource.findMany({
      where,
      include: {
        household: {
          select: { id: true, code: true, governorate: true, district: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: Math.min(parseInt(query.limit || '100', 10), 500),
    });
  },

  async bulkVerify(user, { ids, verified, verificationNote }) {
    const results = [];
    for (const id of ids) {
      const before = await prisma.incomeSource.findUnique({ where: { id } });
      if (!before) continue;
      const after = await prisma.incomeSource.update({
        where: { id },
        data: {
          verified: verified || 'VERIFIED',
          verificationNote,
          verifiedAt: new Date(),
          verifiedById: user.userId,
        },
      });
      await logFieldChanges({
        userId: user.userId,
        householdId: after.householdId,
        action: 'VERIFY_INCOME',
        entity: 'IncomeSource',
        entityId: id,
        changes: [{ fieldName: 'verified', before: before.verified, after: after.verified }],
      });
      results.push(after);
    }
    return results;
  },
};

module.exports = verificationService;
