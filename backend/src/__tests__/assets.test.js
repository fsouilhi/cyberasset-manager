const request = require('supertest');
const app = require('../index');

describe('Assets Routes', () => {
  let accessToken;
  let createdAssetId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: `assets_${Date.now()}@example.com`,
        password: 'password123',
        first_name: 'Test',
        last_name: 'Assets'
      });
    accessToken = res.body.accessToken;
  });

  it('GET /api/assets — sans token = 401', async () => {
    const res = await request(app).get('/api/assets');
    expect(res.statusCode).toBe(401);
  });

  it('GET /api/assets — avec token = 200', async () => {
    const res = await request(app)
      .get('/api/assets')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/assets — cree un actif', async () => {
    const res = await request(app)
      .post('/api/assets')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Serveur Web Test',
        type: 'server',
        ip_address: '192.168.1.100',
        criticality: 4,
        os: 'Ubuntu 22.04'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Serveur Web Test');
    expect(res.body.criticality).toBe(4);
    createdAssetId = res.body.id;
  });

  it('POST /api/assets — type invalide = 400', async () => {
    const res = await request(app)
      .post('/api/assets')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Test', type: 'typeInvalide' });
    expect(res.statusCode).toBe(400);
  });

  it('GET /api/assets/:id — recupere un actif', async () => {
    const res = await request(app)
      .get(`/api/assets/${createdAssetId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(createdAssetId);
  });

  it('PUT /api/assets/:id — modifie un actif', async () => {
    const res = await request(app)
      .put(`/api/assets/${createdAssetId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Serveur Web Modifie',
        type: 'server',
        criticality: 3,
        status: 'active'
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Serveur Web Modifie');
  });

  it('DELETE /api/assets/:id — supprime un actif', async () => {
    const res = await request(app)
      .delete(`/api/assets/${createdAssetId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.statusCode).toBe(200);
  });

  it('GET /api/assets/:id — actif supprime = 404', async () => {
    const res = await request(app)
      .get(`/api/assets/${createdAssetId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.statusCode).toBe(404);
  });
});