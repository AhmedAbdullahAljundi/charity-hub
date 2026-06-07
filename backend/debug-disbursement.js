const prisma = require('./src/config/prisma');
const repo = require('./src/modules/disbursement/disbursement.repository');

async function test() {
  try {
    const households = await repo.findEligibleHouseholds();
    console.log(`Eligible households count: ${households.length}`);
    for (const h of households) {
      console.log(`- ID: ${h.id}, Code: ${h.code}, Family: ${h.familyName}, Tag: ${h.classificationTag}, Decision: ${h.humanDecision}`);
    }

    const configs = await prisma.categoryConfig.findMany();
    console.log(`\nConfigs count: ${configs.length}`);
    for (const c of configs) {
      console.log(`- Code: ${c.code}, Name: ${c.nameAr}, Active: ${c.active}`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
