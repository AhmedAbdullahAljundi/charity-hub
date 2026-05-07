/**
 * Prisma Seed Script
 * 
 * Initializes roles, permissions, and role-permission mappings
 * Run with: npx prisma db seed
 */

const { PrismaClient } = require('@prisma/client');
const { initializeRolesAndPermissions } = require('../src/services/rbac/rbacService');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  try {
    // Initialize roles and permissions
    console.log('📋 Initializing roles and permissions...');
    const summary = await initializeRolesAndPermissions();

    console.log(`✅ Created ${summary.rolesCreated} roles`);
    console.log(`✅ Created ${summary.permissionsCreated} permissions`);
    console.log(`✅ Created ${summary.rolePermissionsCreated} role-permission mappings`);

    // Display role-permission mappings
    console.log('\n📊 Role-Permission Mappings:');
    const roles = await prisma.role.findMany({
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    roles.forEach((role) => {
      const permissions = role.rolePermissions.map((rp) => rp.permission.name);
      console.log(`\n  ${role.name}:`);
      permissions.forEach((perm) => {
        console.log(`    - ${perm}`);
      });
    });

    console.log('\n✅ Database seed completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((error) => {
    console.error('Fatal error during seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
