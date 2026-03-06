const request = require('supertest');
const app = require('../index');

describe('EBIOS RM Routes', () => {
  let accessToken;
  let projectId;
  let businessValueId;
  let fearedEventId;
  let riskSourceId;
  let strategicScenarioId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: `ebios_${Date.now()}@example.com`,
        password: 'password123',
        first_name: 'Test',
        last_name: 'EBIOS'
      });
    accessToken = res.body.accessToken;
  });

  it('POST /api/ebios/projects — cree un projet', async () => {
    const res = await request(app)
      .post('/api/ebios/projects')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Analyse EBIOS - SI RH',
        description: 'Analyse de risques du systeme RH',
        organization: 'Entreprise Test',
        scope: 'Application RH et donnees associees'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Analyse EBIOS - SI RH');
    projectId = res.body.id;
  });

  it('Atelier 1 — cree une valeur metier', async () => {
    const res = await request(app)
      .post(`/api/ebios/projects/${projectId}/business-values`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Donnees RH confidentielles',
        description: 'Donnees personnelles des employes',
        type: 'information',
        responsable: 'DRH'
      });
    expect(res.statusCode).toBe(201);
    businessValueId = res.body.id;
  });

  it('Atelier 1 — cree un evenement redoute', async () => {
    const res = await request(app)
      .post(`/api/ebios/projects/${projectId}/feared-events`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        business_value_id: businessValueId,
        description: 'Fuite de donnees RH vers un concurrent',
        impact_type: 'confidentiality',
        severity: 4
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.severity).toBe(4);
    fearedEventId = res.body.id;
  });

  it('Atelier 2 — cree une source de risque', async () => {
    const res = await request(app)
      .post(`/api/ebios/projects/${projectId}/risk-sources`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Cybercriminel externe',
        category: 'organized_crime',
        motivation: 'Gain financier par revente des donnees',
        pertinence: 3
      });
    expect(res.statusCode).toBe(201);
    riskSourceId = res.body.id;
  });

  it('Atelier 3 — cree un scenario strategique avec calcul de risque automatique', async () => {
    const res = await request(app)
      .post(`/api/ebios/projects/${projectId}/scenarios/strategic`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        risk_source_id: riskSourceId,
        feared_event_id: fearedEventId,
        name: 'Exfiltration via phishing cible',
        likelihood: 3,
        severity: 4
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.risk_level).toBe('unacceptable');
    strategicScenarioId = res.body.id;
  });

  it('Atelier 5 — cree une mesure de securite', async () => {
    const res = await request(app)
      .post(`/api/ebios/projects/${projectId}/measures`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        strategic_scenario_id: strategicScenarioId,
        name: 'Formation anti-phishing',
        type: 'preventive',
        treatment_option: 'reduce',
        status: 'planned',
        responsible: 'RSSI',
        residual_risk_level: 'tolerable'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.type).toBe('preventive');
  });

  it('GET rapport complet du projet', async () => {
    const res = await request(app)
      .get(`/api/ebios/projects/${projectId}/report`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('workshop1');
    expect(res.body).toHaveProperty('workshop2');
    expect(res.body).toHaveProperty('workshop3');
    expect(res.body).toHaveProperty('workshop5');
    expect(res.body.workshop1.businessValues.length).toBeGreaterThan(0);
  });
});