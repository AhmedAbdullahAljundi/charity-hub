const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listUsers() {
    try {
        const users = await prisma.user.findMany({
            include: {
                role: true
            }
        });
        console.log('Users in database:', users.map(u => ({ id: u.id, email: u.email, role: u.role.name })));
    } catch (err) {
        console.error('Error listing users:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}
listUsers();
