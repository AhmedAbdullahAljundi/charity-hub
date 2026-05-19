const request = require('supertest');
const app = require('../../app');
const prisma = require('../../config/prisma');
const bcrypt = require('bcryptjs');

describe('Auth Endpoints', () => {
  let testUser;
  
  beforeAll(async () => {
    await prisma.user.deleteMany({ where: { email: 'test_auth@example.com' } });
    testUser = await prisma.user.create({
      data: {
        name: 'Test Auth User',
        email: 'test_auth@example.com',
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'WORKER'
      }
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: 'test_auth@example.com' } });
    await prisma.$disconnect();
  });

  let accessToken, refreshToken;

  it('should login and return tokens', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test_auth@example.com', password: 'password123' });
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
    
    accessToken = res.body.data.accessToken;
    refreshToken = res.body.data.refreshToken;
  });

  it('should fail with incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test_auth@example.com', password: 'wrong' });
    
    expect(res.status).toBe(401);
  });

  it('should refresh token', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken });
    
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  it('should enforce RBAC - WORKER cannot access admin routes', async () => {
    const res = await request(app)
      .get('/api/admin/rules')
      .set('Authorization', `Bearer ${accessToken}`);
    
    expect(res.status).toBe(403);
  });
});
