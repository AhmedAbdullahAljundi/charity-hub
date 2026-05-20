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
      classification: query.classification,
      decisionStatus: query.decisionStatus || query.humanDecision,
      search: query.search,
      sort: query.sort,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    };

    if (user.role === 'WORKER') {
      const dbUser = await prisma.user.findUnique({ where: { id: user.userId } });
      if (dbUser?.assignedGovernorate) filters.governorate = dbUser.assignedGovernorate;
      if (dbUser?.assignedDistrict) filters.district = dbUser.assignedDistrict;
    }

    const [rows, total] = await householdsRepository.findMany(filters, { page, limit });
    const data = await Promise.all(rows.map((h) => applyPiiResponse(req, enrichListRow(h), h.id)));
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
        primaryPhone: body.primaryPhone,
        secondaryPhone: body.secondaryPhone,
        whatsappPhone: body.whatsappPhone,
        socialStatus: body.socialStatus,
        divorceYear: body.divorceYear ? parseInt(body.divorceYear, 10) : undefined,
        divorceDocNumber: body.divorceDocNumber,
        marriageCount: body.marriageCount,
        deathCertNumber: body.deathCertNumber,
        deathDate: body.deathDate ? new Date(body.deathDate) : undefined,
        addressRegion: body.addressRegion,
        addressStreet: body.addressStreet,
        addressDetails: body.addressDetails,
        registrationDate: body.registrationDate ? new Date(body.registrationDate) : undefined,
        searchType: body.searchType,
        isModest: body.isModest,
        officeDealings: body.officeDealings,
        fieldNotes: body.fieldNotes,
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
      code: body.code,
      governorate: body.governorate,
      district: body.district,
      village: body.village,
      address: body.address,
      primaryPhone: body.primaryPhone,
      secondaryPhone: body.secondaryPhone,
      whatsappPhone: body.whatsappPhone,
      socialStatus: body.socialStatus,
      divorceYear: body.divorceYear ? parseInt(body.divorceYear, 10) : undefined,
      divorceDocNumber: body.divorceDocNumber,
      marriageCount: body.marriageCount,
      deathCertNumber: body.deathCertNumber,
      deathDate: body.deathDate ? new Date(body.deathDate) : undefined,
      addressRegion: body.addressRegion,
      addressStreet: body.addressStreet,
      addressDetails: body.addressDetails,
      registrationDate: body.registrationDate ? new Date(body.registrationDate) : undefined,
      searchType: body.searchType,
      isModest: body.isModest,
      officeDealings: body.officeDealings,
      fieldNotes: body.fieldNotes,
      housingType: body.housingType,
      hasRationCard: body.hasRationCard,
      hasFamilySupport: body.hasFamilySupport,
      hasFoodAid: body.hasFoodAid,
      bankAssetGrade: body.bankAssetGrade,
      notes: body.notes,
      isDraft: body.isDraft,
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

function enrichListRow(row) {
  const latestScore = row.scoreResults?.[0] || null;
  const head = row.persons?.find((p) => p.role === 'HEAD') || row.persons?.find((p) => p.gender === 'MALE');
  const spouse = row.persons?.find((p) => p.role === 'SPOUSE') || row.persons?.find((p) => p.gender === 'FEMALE');
  const totalMonthlyIncome = (row.incomeSources || []).reduce(
    (sum, source) => sum + Number(source.monthlyAmount || 0),
    0
  );
  const totalPersons = row.persons?.length || 0;
  const dependentCount = (row.persons || []).filter(isDependentForList).length;
  const personTags = {
    hasDiseases: (row.persons || []).some((p) => (p.diseases || []).length > 0),
    hasDisabilities: (row.persons || []).some((p) => (p.disabilities || []).length > 0),
    hasStudent: (row.persons || []).some((p) => p.isStudent === true),
    hasBride: (row.persons || []).some((p) => p.isBride === true),
    hasOrphan: (row.persons || []).some((p) => p.isOrphan === true),
  };
  const classificationTag = latestScore?.classificationTag || extractClassificationTag(latestScore?.decisionNote);

  return {
    ...serializeHousehold(row),
    dependentCount,
    totalPersons,
    totalMembersCount: totalPersons,
    totalMonthlyIncome,
    personTags,
    latestClassification: classificationTag || latestScore?.decisionNote || null,
    latestDecisionStatus: latestScore?.humanDecision || null,
    latestScore: latestScore
      ? {
          ...serializeHousehold({ scoreResults: [latestScore] }).scoreResults[0],
          classificationTag,
          assistanceType: latestScore.assistanceType || null,
        }
      : null,
    headName: head?.name || null,
    spouseName: spouse?.name || null,
    headNationalId: head?.nationalId || null,
    spouseNationalId: spouse?.nationalId || null,
  };
}

function isDependentForList(person) {
  const age = getAge(person);
  if (age == null) return false;
  return (
    age < 15 ||
    (person.gender === 'FEMALE' && age < 25 && person.maritalStatus === 'SINGLE') ||
    (person.gender === 'MALE' && person.isStudent === true)
  );
}

function getAge(person) {
  const nationalIdAge = getAgeFromNationalId(person.nationalId);
  if (nationalIdAge != null) return nationalIdAge;
  if (!person.birthDate) return null;
  const birthDate = new Date(person.birthDate);
  if (Number.isNaN(birthDate.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const beforeBirthday =
    now.getMonth() < birthDate.getMonth() ||
    (now.getMonth() === birthDate.getMonth() && now.getDate() < birthDate.getDate());
  if (beforeBirthday) age -= 1;
  return age;
}

function getAgeFromNationalId(nationalId) {
  if (!nationalId || !/^[23]\d{13}$/.test(nationalId)) return null;
  const century = nationalId[0] === '2' ? 1900 : 2000;
  const year = century + Number(nationalId.slice(1, 3));
  const month = Number(nationalId.slice(3, 5)) - 1;
  const day = Number(nationalId.slice(5, 7));
  const birthDate = new Date(year, month, day);
  if (
    birthDate.getFullYear() !== year ||
    birthDate.getMonth() !== month ||
    birthDate.getDate() !== day
  ) {
    return null;
  }
  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const beforeBirthday =
    now.getMonth() < birthDate.getMonth() ||
    (now.getMonth() === birthDate.getMonth() && now.getDate() < birthDate.getDate());
  if (beforeBirthday) age -= 1;
  return age;
}

function extractClassificationTag(note) {
  if (!note) return null;
  const tags = [
    'أيتام',
    'فقراء',
    'مساكين',
    'أسر سجناء',
    'ذوو إعاقة',
    'مسنون',
    'أمراض مزمنة',
    'حالات هجر',
    'طالب علم',
    'كبار سن',
    'لا يستحق',
  ];
  return tags.find((tag) => note.includes(tag)) || null;
}

module.exports = householdsService;
