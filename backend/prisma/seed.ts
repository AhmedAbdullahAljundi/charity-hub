import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding deterministic dataset...');

  const hash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@charityhub.org' },
    update: {},
    create: {
      name: 'System Admin',
      email: 'admin@charityhub.org',
      passwordHash: hash,
      role: 'ADMIN',
    },
  });

  const supervisor = await prisma.user.upsert({
    where: { email: 'supervisor@charityhub.org' },
    update: {},
    create: {
      name: 'Area Supervisor',
      email: 'supervisor@charityhub.org',
      passwordHash: hash,
      role: 'SUPERVISOR',
    },
  });

  const worker = await prisma.user.upsert({
    where: { email: 'worker@charityhub.org' },
    update: {},
    create: {
      name: 'Field Worker',
      email: 'worker@charityhub.org',
      passwordHash: hash,
      role: 'WORKER',
    },
  });

  console.log('Users seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
