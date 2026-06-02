const prisma = require('../src/config/prisma');
const educationService = require('../src/modules/education/education.service');

async function test() {
  try {
    const user = { id: 'admin-id' };
    
    // Pick any existing household
    const hh = await prisma.household.findFirst();
    if (!hh) {
        console.log("No household found to test with");
        return;
    }
    
    // Pick any existing person
    const p = await prisma.person.findFirst({ where: { householdId: hh.id } });
    if (!p) {
        console.log("No person found in household");
        return;
    }

    console.log("Using Household Code:", hh.code);
    console.log("Using Person ID:", p.id);

    const body = {
      householdId: hh.code, // simulate user typing the code
      personId: p.id,       // simulate user typing the person ID
      academicYear: '2025-2026',
      studentLevel: 'PRIMARY',
      gradeInputType: 'LETTER',
      quranJuzCount: null,
      quranGrade: null,
      quranAbsenceDays: null,
      subjects: []
    };

    console.log("Calling create...");
    const result = await educationService.create(body, user);
    console.log("SUCCESS:", result);
  } catch (err) {
    console.error("ERROR CAUGHT:");
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
