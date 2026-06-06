const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Migrating decision data from ScoreResult -> Household...');

  const households = await prisma.household.findMany({
    select: { id: true },
  });

  let migrated = 0;

  for (const hh of households) {
    const latest = await prisma.scoreResult.findFirst({
      where: { householdId: hh.id },
      orderBy: { calculatedAt: 'desc' },
      select: {
        humanDecision: true,
        reviewStatus: true,
        decisionNote: true,
        decidedById: true,
        decidedAt: true,
      },
    });

    if (!latest) continue;

    // Only migrate if a real decision was made, not the default pending score state.
    if (latest.humanDecision !== 'PENDING' || latest.reviewStatus !== 'SCORE_READY') {
      await prisma.household.update({
        where: { id: hh.id },
        data: {
          humanDecision: latest.humanDecision,
          reviewStatus: latest.reviewStatus,
          decisionNote: latest.decisionNote,
          decidedById: latest.decidedById,
          decidedAt: latest.decidedAt,
        },
      });
      migrated++;
    }
  }

  console.log(`Done. Migrated decisions for ${migrated} households.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
