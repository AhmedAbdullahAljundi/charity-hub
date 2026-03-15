const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    const families = await prisma.family.findMany({
        include: {
            scoringRecords: {
                orderBy: { calculated_at: 'desc' },
                take: 1
            },
            incomes: true
        }
    });

    if (families.length > 0) {
        const family = families[0];
        console.log('Family ID:', family.id);
        console.log('Incomes count:', family.incomes.length);
        console.log('Latest Scoring Total Income:', family.scoringRecords[0]?.total_income);
    } else {
        console.log('No families found');
    }
}

test().catch(console.error).finally(() => prisma.$disconnect());
