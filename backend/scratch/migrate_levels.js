const prisma = require('../src/config/prisma');

async function migrateData() {
  try {
    console.log("Updating Person records...");
    await prisma.$executeRaw`UPDATE "Person" SET "studentLevel" = 'KINDERGARTEN' WHERE "studentLevel" = 'CHILD'`;
    await prisma.$executeRaw`UPDATE "Person" SET "studentLevel" = 'SECONDARY_INDUSTRIAL_COMMERCIAL_GIRLS' WHERE "studentLevel" = 'SECONDARY_VOCATIONAL_FEMALE'`;
    await prisma.$executeRaw`UPDATE "Person" SET "studentLevel" = 'SECONDARY_INDUSTRIAL_COMMERCIAL_BOYS' WHERE "studentLevel" = 'SECONDARY_VOCATIONAL_MALE'`;
    await prisma.$executeRaw`UPDATE "Person" SET "studentLevel" = 'UNIVERSITY_THEORETICAL' WHERE "studentLevel" = 'UNIVERSITY_HUMANITIES'`;

    console.log("Updating StudentAcademicRecord records...");
    await prisma.$executeRaw`UPDATE "StudentAcademicRecord" SET "studentLevel" = 'KINDERGARTEN' WHERE "studentLevel" = 'CHILD'`;
    await prisma.$executeRaw`UPDATE "StudentAcademicRecord" SET "studentLevel" = 'SECONDARY_INDUSTRIAL_COMMERCIAL_GIRLS' WHERE "studentLevel" = 'SECONDARY_VOCATIONAL_FEMALE'`;
    await prisma.$executeRaw`UPDATE "StudentAcademicRecord" SET "studentLevel" = 'SECONDARY_INDUSTRIAL_COMMERCIAL_BOYS' WHERE "studentLevel" = 'SECONDARY_VOCATIONAL_MALE'`;
    await prisma.$executeRaw`UPDATE "StudentAcademicRecord" SET "studentLevel" = 'UNIVERSITY_THEORETICAL' WHERE "studentLevel" = 'UNIVERSITY_HUMANITIES'`;

    console.log("Migration complete.");
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

migrateData();
