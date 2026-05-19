const request = require('supertest');
const app = require('../../app');
const prisma = require('../../config/prisma');
const bcrypt = require('bcryptjs');

describe('Admin Rules Override Endpoints', () => {
  let adminUser;
  let adminToken;

  beforeAll(async () => {
    // Delete in correct order to avoid foreign key errors
    await prisma.auditLog.deleteMany({ where: { user: { email: 'admin_rules@example.com' } } });
    await prisma.ruleOverride.deleteMany();
    await prisma.user.deleteMany({ where: { email: 'admin_rules@example.com' } });

    adminUser = await prisma.user.create({
      data: {
        name: 'Rule Admin', email: 'admin_rules@example.com', passwordHash: await bcrypt.hash('pass', 10), role: 'ADMIN'
      }
    });

    const res = await request(app).post('/api/auth/login').send({ email: 'admin_rules@example.com', password: 'pass' });
    adminToken = res.body.data.accessToken;
  });

  afterAll(async () => {
    await prisma.auditLog.deleteMany({ where: { userId: adminUser.id } });
    await prisma.ruleOverride.deleteMany();
    await prisma.user.deleteMany({ where: { id: adminUser.id } });
    await prisma.$disconnect();
  });

  it('should list all rules', async () => {
    const res = await request(app)
      .get('/api/admin/rules')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.data.rules).toBeDefined();
    expect(res.body.data.rules.length).toBeGreaterThan(0);
  });

  it('should upsert an override rule', async () => {
    const res = await request(app)
      .put('/api/admin/rules/disease_treatment')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ overrideValue: 25, reason: 'Testing impact' });
    
    expect(res.status).toBe(200);
    expect(res.body.data.overrideValue.toString()).toBe('25');
  });

  it('should list rules with overridden flag', async () => {
    const res = await request(app)
      .get('/api/admin/rules')
      .set('Authorization', `Bearer ${adminToken}`);
    
    const rule = res.body.data.rules.find(r => r.id === 'disease_treatment');
    expect(rule.overridden).toBe(true);
    expect(rule.effectiveValue).toBe('25');
  });

  it('should simulate rule impact', async () => {
    const res = await request(app)
      .post('/api/admin/rules/disease_treatment/simulate')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ overrideValue: 30 });
    
    expect(res.status).toBe(200);
    expect(res.body.data.ruleId).toBe('disease_treatment');
    expect(res.body.data.sampled).toBeDefined();
    expect(res.body.data.affectedHouseholds).toBeDefined();
  });

  it('should revert rule override', async () => {
    const res = await request(app)
      .delete('/api/admin/rules/disease_treatment/override')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.data.reverted).toBe(true);

    const listRes = await request(app)
      .get('/api/admin/rules')
      .set('Authorization', `Bearer ${adminToken}`);
    
    const rule = listRes.body.data.rules.find(r => r.id === 'disease_treatment');
    expect(rule.overridden).toBe(false);
  });
});
