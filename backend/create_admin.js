// create_admin.js
// Script to ensure an admin user exists in the database.
// Run with: node create_admin.js (from the backend folder)

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@charityhub.com';
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
        console.log('✅ Admin user already exists with id:', existing.id);
        return;
    }

    const hashed = await bcrypt.hash('password123', 10);

    // Ensure Admin role exists
    const adminRole = await prisma.role.upsert({
        where: { name: 'Admin' },
        update: {},
        create: { name: 'Admin' },
    });

    const admin = await prisma.user.create({
        data: {
            email,
            password: hashed,
            name: 'Admin User',
            role: { connect: { id: adminRole.id } },
        },
    });

    console.log('✅ Admin user created with id:', admin.id);
}

main()
    .catch((e) => {
        console.error('Error creating admin user:', e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
