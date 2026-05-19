const prisma = require('../../config/prisma');

const auditService = {
  async list(query) {
    const where = {};
    if (query.householdId) where.householdId = query.householdId;
    if (query.userId) where.userId = query.userId;
    if (query.entity) where.entity = query.entity;
    if (query.fieldName) where.fieldName = { contains: query.fieldName };
    if (query.from || query.to) {
      where.createdAt = {};
      if (query.from) where.createdAt.gte = new Date(query.from);
      if (query.to) where.createdAt.lte = new Date(query.to);
    }

    const page = parseInt(query.page || '1', 10);
    const limit = Math.min(parseInt(query.limit || '50', 10), 200);

    const [data, total] = await prisma.$transaction([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { user: { select: { id: true, name: true, email: true, role: true } } },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { data, meta: { page, limit, total } };
  },
};

module.exports = auditService;
