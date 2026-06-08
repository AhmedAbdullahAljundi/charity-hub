const prisma = require('./src/config/prisma');
const repo = require('./src/modules/disbursement/disbursement.repository');

async function test() {
  try {
    const households = await repo.findEligibleHouseholds();
    console.log(`Eligible households count: ${households.length}`);
    for (const h of households) {
      const latest = h.scoreResults?.[0];
      console.log(`- ID: ${h.id}, Code: ${h.code}, Family: ${h.familyName}, Tag: ${h.classificationTag}, Decision: ${h.humanDecision}, isDraft: ${h.isDraft}`);
      if (latest) {
         console.log(`    ScoreResult: percent=${latest.normalizedPercent}, assistanceType=${latest.assistanceType}`);
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
