import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ─── Disbursement Config Defaults ────────────────────────────────────────────

const defaultCategories = [
  { code: 'كفالة أيتام', nameAr: 'كفالة أيتام',   nameEn: 'Orphans',    maxAmount: 700,  maxPerChild: 700, widowBonus: 200, capWithDeps: 1400, capNoDeps: 800  },
  { code: 'ملف إعاقة',   nameAr: 'ملف إعاقة',     nameEn: 'Disability', maxAmount: 700,  capWithDeps: 700,  capNoDeps: 700  },
  { code: 'طلاب علم',    nameAr: 'طلاب علم',      nameEn: 'Students',   baseMax: 400,  perDepMax: 200, capWithDeps: 1000, capNoDeps: 400 },
  { code: 'أسر سجناء',   nameAr: 'أسر سجناء',     nameEn: 'Prisoners',  baseMax: 450,  perDepMax: 200, capWithDeps: 1000, capNoDeps: 400 },
  { code: 'مساعدات',     nameAr: 'مساعدات',       nameEn: 'Aid',        maxAmount: 700, poorScoreThreshold: 60, capWithDeps: 1000, capNoDeps: 500 },
  { code: 'دعم خارجي',   nameAr: 'دعم خارجي',     nameEn: 'External',   maxAmount: 500, capWithDeps: 500,  capNoDeps: 500  },
  { code: 'منفردون',     nameAr: 'منفردون',       nameEn: 'Singles',    maxAmount: 500, capWithDeps: 500,  capNoDeps: 500  },
  { code: 'مطلقات',      nameAr: 'مطلقات',        nameEn: 'Divorced',   baseMax: 400,  perDepMax: 200, capWithDeps: 900,  capNoDeps: 400 },
  { code: 'مساكين',      nameAr: 'مساكين',        nameEn: 'Needy',      maxAmount: 500, capWithDeps: 700,  capNoDeps: 500  },
  { code: 'علاج شهري',   nameAr: 'علاج شهري',     nameEn: 'Medical',    maxAmount: 500, capWithDeps: 500,  capNoDeps: 500  },
  { code: 'مساعدات موسمية', nameAr: 'مساعدات موسمية', nameEn: 'Seasonal', maxAmount: 0,   capWithDeps: 0,    capNoDeps: 0    },
];

const defaultGrants = [
  { code: 'ORPHAN_MONTHLY',    nameAr: 'قبض الأيتام',  nameEn: 'Orphan Monthly',  type: 'MONTHLY' as const, amount: 700, isPerUnit: true,  condition: 'isOrphan',         categoryFilter: JSON.stringify(['كفالة أيتام', 'أيتام']) },
  { code: 'EDUCATION_MONTHLY', nameAr: 'حافز تعليم',   nameEn: 'Education Bonus', type: 'MONTHLY' as const, amount: 200, isPerUnit: false, condition: 'hasStudents',       categoryFilter: null },
  { code: 'QURAN_MONTHLY',     nameAr: 'حافز قرآن',    nameEn: 'Quran Bonus',     type: 'MONTHLY' as const, amount: 100, isPerUnit: false, condition: 'hasQuranStudents',  categoryFilter: null },
  { code: 'MERGE',             nameAr: 'حافز دمج',     nameEn: 'Merge Bonus',     type: 'MONTHLY' as const, amount: 200, isPerUnit: false, condition: 'hasMerge',          categoryFilter: null },
];

async function main() {
  console.log('Seeding deterministic dataset...');

  const hash = await bcrypt.hash('password123', 10);

  await prisma.user.upsert({
    where:  { email: 'admin@charityhub.org' },
    update: {},
    create: { name: 'System Admin',    email: 'admin@charityhub.org',      passwordHash: hash, role: 'ADMIN' },
  });
  await prisma.user.upsert({
    where:  { email: 'supervisor@charityhub.org' },
    update: {},
    create: { name: 'Area Supervisor', email: 'supervisor@charityhub.org', passwordHash: hash, role: 'SUPERVISOR' },
  });
  await prisma.user.upsert({
    where:  { email: 'worker@charityhub.org' },
    update: {},
    create: { name: 'Field Worker',    email: 'worker@charityhub.org',     passwordHash: hash, role: 'WORKER' },
  });
  console.log('Users seeded');

  // ── CategoryConfig ────────────────────────────────────────────────────────
  for (const cat of defaultCategories) {
    await prisma.categoryConfig.upsert({
      where:  { code: cat.code },
      update: { nameAr: cat.nameAr, nameEn: cat.nameEn },
      create: {
        code:               cat.code,
        nameAr:             cat.nameAr,
        nameEn:             cat.nameEn,
        maxAmount:          (cat as any).maxAmount          ?? null,
        maxPerChild:        (cat as any).maxPerChild        ?? null,
        widowBonus:         (cat as any).widowBonus         ?? null,
        baseMax:            (cat as any).baseMax            ?? null,
        perDepMax:          (cat as any).perDepMax          ?? null,
        poorScoreThreshold: (cat as any).poorScoreThreshold ?? null,
        capWithDeps:        cat.capWithDeps,
        capNoDeps:          cat.capNoDeps,
        active:             true,
      },
    });
  }
  console.log('CategoryConfig seeded');

  // ── GrantConfig ───────────────────────────────────────────────────────────
  for (const grant of defaultGrants) {
    await prisma.grantConfig.upsert({
      where:  { code: grant.code },
      update: { nameAr: grant.nameAr, amount: grant.amount },
      create: {
        code:           grant.code,
        nameAr:         grant.nameAr,
        nameEn:         grant.nameEn,
        type:           grant.type,
        amount:         grant.amount,
        isPerUnit:      grant.isPerUnit,
        condition:      grant.condition,
        categoryFilter: grant.categoryFilter,
        active:         true,
      },
    });
  }
  console.log('GrantConfig seeded');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
