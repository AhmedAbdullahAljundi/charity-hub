const { ConflictError } = require('../../utils/errors');
const { householdsRepository } = require('./households.repository');
const { assertHouseholdAccessById } = require('../../shared/householdAccess');
const { serializeHousehold } = require('../../shared/serializers');
const { applyPiiResponse } = require('../../middleware/pii');
const prisma = require('../../config/prisma');

async function generateCode(governorate) {
  const prefix = governorate.slice(0, 3).toUpperCase().replace(/\s/g, '') || 'HH';
  const count = await prisma.household.count();
  return `GOV-${prefix}-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
}

const householdsService = {
  async list(user, query, req) {
    const page = parseInt(query.page || '1', 10);
    const limit = Math.min(parseInt(query.limit || '20', 10), 100);
    const filters = {
      governorate: query.governorate,
      district: query.district,
      isDraft: query.isDraft,
      eligibility: query.eligibility,
    };

    if (user.role === 'WORKER') {
      const dbUser = await prisma.user.findUnique({ where: { id: user.userId } });
      if (dbUser?.assignedGovernorate) filters.governorate = dbUser.assignedGovernorate;
      if (dbUser?.assignedDistrict) filters.district = dbUser.assignedDistrict;
    }

    const [rows, total] = await householdsRepository.findMany(filters, { page, limit });
    const data = await Promise.all(
      rows.map((h) => applyPiiResponse(req, serializeHousehold(h), h.id))
    );
    return { data, meta: { page, limit, total, pages: Math.ceil(total / limit) } };
  },

  async getById(user, id, req) {
    await assertHouseholdAccessById(user, id);
    const row = await householdsRepository.findById(id);
    return await applyPiiResponse(req, serializeHousehold(row), id);
  },

  async create(user, body) {
    const code = body.code || (await generateCode(body.governorate));
    try {
      const row = await householdsRepository.create({
        code,
        governorate: body.governorate,
        district: body.district,
        village: body.village,
        address: body.address,
        housingType: body.housingType || 'OWNED',
        hasRationCard: body.hasRationCard ?? true,
        hasFamilySupport: body.hasFamilySupport ?? false,
        hasFoodAid: body.hasFoodAid ?? false,
        bankAssetGrade: body.bankAssetGrade,
        notes: body.notes,
        isDraft: true,
        lastDraftSavedAt: new Date(),
        createdById: user.userId,
      });
      return serializeHousehold(row);
    } catch (e) {
      if (e.code === 'P2002') throw new ConflictError('Household code already exists');
      throw e;
    }
  },

  async update(user, id, body) {
    await assertHouseholdAccessById(user, id);
    const row = await householdsRepository.update(id, {
      governorate: body.governorate,
      district: body.district,
      village: body.village,
      address: body.address,
      housingType: body.housingType,
      hasRationCard: body.hasRationCard,
      hasFamilySupport: body.hasFamilySupport,
      hasFoodAid: body.hasFoodAid,
      bankAssetGrade: body.bankAssetGrade,
      notes: body.notes,
      lastDraftSavedAt: new Date(),
    });
    return serializeHousehold(row);
  },

  async remove(user, id) {
    await assertHouseholdAccessById(user, id);
    await householdsRepository.delete(id);
  },

  async publish(user, id) {
    await assertHouseholdAccessById(user, id);
    const row = await householdsRepository.publish(id);
    return serializeHousehold(row);
  },
};

module.exports = householdsService;
