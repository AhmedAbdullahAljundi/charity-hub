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

    // Seed Physics Models for Antigravity Research Platform
    console.log('\n🔬 Seeding physics models...');
    const physicsModels = [
      {
        name: 'Newtonian Gravity',
        description: 'Classical gravitational force between two masses using Newton\'s law of universal gravitation.',
        equation: 'F = G × m₁ × m₂ / r²',
        category: 'classical',
        parameters: { mass1: 'kg', mass2: 'kg', distance: 'm' },
      },
      {
        name: 'Relativistic Energy',
        description: 'Einstein\'s special relativity energy calculation with Lorentz factor.',
        equation: 'E = γmc²',
        category: 'relativistic',
        parameters: { mass: 'kg', velocity: 'm/s' },
      },
      {
        name: 'Quantum Oscillator',
        description: 'Quantum harmonic oscillator energy levels and zero-point energy.',
        equation: 'E_n = ℏω(n + ½)',
        category: 'quantum',
        parameters: { angular_frequency: 'rad/s', quantum_number: 'integer', mass: 'kg' },
      },
      {
        name: 'Anti-Gravity Field',
        description: 'Theoretical repulsive gravitational field model with coupling constant and trajectory simulation.',
        equation: 'F_ag = -G_eff × m × S / r²',
        category: 'anti_gravity_field',
        parameters: { mass: 'kg', field_strength: 'N/kg', distance: 'm', coupling_constant: 'dimensionless' },
      },
      {
        name: 'Electromagnetic',
        description: 'Lorentz force calculation for charged particles in electric and magnetic fields.',
        equation: 'F = qE + qv×B',
        category: 'electromagnetic',
        parameters: { charge: 'C', electric_field: 'V/m', magnetic_field: 'T', velocity: 'm/s' },
      },
    ];

    for (const model of physicsModels) {
      await prisma.physicsModel.upsert({
        where: { name: model.name },
        update: model,
        create: model,
      });
    }
    console.log(`✅ Seeded ${physicsModels.length} physics models`);

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
