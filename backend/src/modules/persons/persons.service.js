const prisma = require('../../config/prisma');
const { NotFoundError } = require('../../utils/errors');
const { assertHouseholdAccessById } = require('../../shared/householdAccess');
const { serializePerson } = require('../../shared/serializers');

async function assertPersonInHousehold(householdId, personId) {
  const person = await prisma.person.findFirst({
    where: { id: personId, householdId },
    include: { diseases: true, disabilities: true },
  });
  if (!person) throw new NotFoundError('Person');
  return person;
}

const personsService = {
  async create(user, householdId, body) {
    await assertHouseholdAccessById(user, householdId);
    
    if (body.nationalId) {
      const existingPerson = await prisma.person.findFirst({
        where: { nationalId: body.nationalId },
      });
      if (existingPerson) {
        if (existingPerson.householdId === householdId) {
          const row = await prisma.person.update({
            where: { id: existingPerson.id },
            data: { ...body, birthDate: body.birthDate ? new Date(body.birthDate) : undefined },
            include: { diseases: true, disabilities: true },
          });
          return serializePerson(row);
        } else {
          const { AppError } = require('../../utils/errors');
          throw new AppError('الرقم القومي مسجل بالفعل لفرد في أسرة أخرى', 409, 'CONFLICT_ERROR');
        }
      }
    }

    const row = await prisma.person.create({
      data: { ...body, nationalId: body.nationalId, householdId, birthDate: body.birthDate ? new Date(body.birthDate) : undefined },
      include: { diseases: true, disabilities: true },
    });
    return serializePerson(row);
  },

  async update(user, householdId, personId, body) {
    await assertHouseholdAccessById(user, householdId);
    await assertPersonInHousehold(householdId, personId);

    if (body.nationalId) {
      const existingPerson = await prisma.person.findFirst({
        where: { nationalId: body.nationalId },
      });
      if (existingPerson && existingPerson.id !== personId) {
        const { AppError } = require('../../utils/errors');
        if (existingPerson.householdId === householdId) {
          throw new AppError('الرقم القومي مسجل بالفعل لفرد آخر في نفس الأسرة', 409, 'CONFLICT_ERROR');
        } else {
          throw new AppError('الرقم القومي مسجل بالفعل لفرد في أسرة أخرى', 409, 'CONFLICT_ERROR');
        }
      }
    }

    const row = await prisma.person.update({
      where: { id: personId },
      data: {
        ...body,
        nationalId: body.nationalId,
        birthDate: body.birthDate ? new Date(body.birthDate) : undefined,
      },
      include: { diseases: true, disabilities: true },
    });
    return serializePerson(row);
  },

  async remove(user, householdId, personId) {
    await assertHouseholdAccessById(user, householdId);
    await assertPersonInHousehold(householdId, personId);
    await prisma.person.delete({ where: { id: personId } });
  },

  async createDisease(user, householdId, personId, body) {
    await assertHouseholdAccessById(user, householdId);
    await assertPersonInHousehold(householdId, personId);
    return prisma.disease.create({ data: { ...body, personId } });
  },

  async updateDisease(user, householdId, personId, diseaseId, body) {
    await assertHouseholdAccessById(user, householdId);
    const disease = await prisma.disease.findFirst({ where: { id: diseaseId, person: { householdId } } });
    if (!disease) throw new NotFoundError('Disease');
    return prisma.disease.update({ where: { id: diseaseId }, data: body });
  },

  async removeDisease(user, householdId, personId, diseaseId) {
    await assertHouseholdAccessById(user, householdId);
    await prisma.disease.deleteMany({ where: { id: diseaseId, person: { householdId } } });
  },

  async createDisability(user, householdId, personId, body) {
    await assertHouseholdAccessById(user, householdId);
    await assertPersonInHousehold(householdId, personId);
    return prisma.disability.create({ data: { ...body, personId } });
  },

  async updateDisability(user, householdId, personId, disabilityId, body) {
    await assertHouseholdAccessById(user, householdId);
    const row = await prisma.disability.findFirst({ where: { id: disabilityId, person: { householdId } } });
    if (!row) throw new NotFoundError('Disability');
    return prisma.disability.update({ where: { id: disabilityId }, data: body });
  },

  async removeDisability(user, householdId, personId, disabilityId) {
    await assertHouseholdAccessById(user, householdId);
    await prisma.disability.deleteMany({ where: { id: disabilityId, person: { householdId } } });
  },
};

module.exports = personsService;
