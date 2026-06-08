const prisma = require('./src/config/prisma');

async function fix() {
  try {
    const latestScore = await prisma.scoreResult.findFirst({
      where: { householdId: 'cmpud7z0x01o3143p3fbziln1' },
      orderBy: { calculatedAt: 'desc' }
    });
    
    if (latestScore) {
      await prisma.scoreResult.update({
        where: { id: latestScore.id },
        data: { assistanceType: 'MONTHLY_CASH' }
      });
      console.log('Fixed score result!');
    }
    
    // Also change Tag from '5' to 'مساعدات' so that the disbursement calculation finds a config
    await prisma.household.update({
      where: { id: 'cmpud7z0x01o3143p3fbziln1' },
      data: { classificationTag: 'مساعدات', isDraft: false }
    });
    console.log('Fixed household!');
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

fix();
