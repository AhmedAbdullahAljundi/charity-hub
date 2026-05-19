const request = require('supertest');
const app = require('../../app');
const prisma = require('../../config/prisma');
const bcrypt = require('bcryptjs');

describe('Scoring & Simulation Endpoints', () => {
  let testUser, adminUser, testHousehold;
  let accessToken, adminToken;

  beforeAll(async () => {
    // Pre-test cleanup: Delete in dependency order
    await prisma.scoreResult.deleteMany({
      where: {
        household: { code: 'TEST-SCORING-01' }
      }
    });
    await prisma.person.deleteMany({
      where: {
        household: { code: 'TEST-SCORING-01' }
      }
    });
    await prisma.household.deleteMany({
      where: { code: 'TEST-SCORING-01' }
    });
    await prisma.user.deleteMany({
      where: { email: { in: ['worker@example.com', 'admin@example.com'] } }
    });

    // Create users
    testUser = await prisma.user.create({
      data: {
        name: 'Worker', email: 'worker@example.com', passwordHash: await bcrypt.hash('pass', 10), role: 'WORKER'
      }
    });
    adminUser = await prisma.user.create({
      data: {
        name: 'Admin', email: 'admin@example.com', passwordHash: await bcrypt.hash('pass', 10), role: 'ADMIN'
      }
    });

    // Create household
    testHousehold = await prisma.household.create({
      data: {
        code: 'TEST-SCORING-01',
        governorate: 'Cairo', district: 'Maadi', village: 'Degla',
        isDraft: false,
        createdById: testUser.id,
        persons: {
          create: [{ name: 'Head', gender: 'MALE', birthDate: new Date('1980-01-01'), role: 'HEAD' }]
        }
      }
    });

    const res1 = await request(app).post('/api/auth/login').send({ email: 'worker@example.com', password: 'pass' });
    accessToken = res1.body.data.accessToken;

    const res2 = await request(app).post('/api/auth/login').send({ email: 'admin@example.com', password: 'pass' });
    adminToken = res2.body.data.accessToken;
  });

  afterAll(async () => {
    if (testHousehold) {
      await prisma.scoreResult.deleteMany({ where: { householdId: testHousehold.id } });
      await prisma.person.deleteMany({ where: { householdId: testHousehold.id } });
      await prisma.household.deleteMany({ where: { id: testHousehold.id } });
    }
    await prisma.user.deleteMany({ where: { email: { in: ['worker@example.com', 'admin@example.com'] } } });
    await prisma.$disconnect();
  });

  it('should calculate score for household', async () => {
    const res = await request(app)
      .post(`/api/households/${testHousehold.id}/calculate`)
      .set('Authorization', `Bearer ${accessToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.finalScore).toBeDefined();
    expect(res.body.data.systemRecommendation).toBeDefined();
  });

  it('should simulate score with modifications', async () => {
    const res = await request(app)
      .post('/api/simulate')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        householdId: testHousehold.id,
        modifications: [
          { field: 'income.SALARY', value: '5000' }
        ]
      });

    expect(res.status).toBe(200);
    expect(res.body.data.originalScore).toBeDefined();
    expect(res.body.data.simulatedScore).toBeDefined();
    expect(res.body.data.scoreDelta).toBeDefined();
  });

  it('should allow admin to record human decision', async () => {
    const res = await request(app)
      .patch(`/api/households/${testHousehold.id}/score-latest/decide`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ humanDecision: 'APPROVED', decisionNote: 'Looks good' });
    
    expect(res.status).toBe(200);
    expect(res.body.data.humanDecision).toBe('APPROVED');
  });

  it('should prevent worker from recording human decision', async () => {
    const res = await request(app)
      .patch(`/api/households/${testHousehold.id}/score-latest/decide`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ humanDecision: 'APPROVED', decisionNote: 'Looks good' });
    
    expect(res.status).toBe(403);
  });
});
