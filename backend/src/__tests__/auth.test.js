const request = require('supertest');
const app = require('../index');

describe(' Auth Routes', () => {
  const testEmail = `test_${Date.now()}@example.com`;
  let accessToken;

  it('POST /api/auth/register — crée un utilisateur', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: testEmail,
        password: 'password123',
        first_name: 'Test',
        last_name: 'User'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body.user.email).toBe(testEmail);
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('POST /api/auth/register — email déjà utilisé = 409', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: testEmail, password: 'password123' });
    expect(res.statusCode).toBe(409);
  });

  it('POST /api/auth/register — email invalide = 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'pasunemail', password: 'password123' });
    expect(res.statusCode).toBe(400);
  });

  it('POST /api/auth/login — connexion réussie', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: 'password123' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    accessToken = res.body.accessToken;
  });

  it('POST /api/auth/login — mauvais mot de passe = 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: 'mauvaismdp' });
    expect(res.statusCode).toBe(401);
  });

  it('POST /api/auth/refresh — rafraîchit le token', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: 'password123' });
    const refreshToken = loginRes.body.refreshToken;
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
  });
});