const express = require('express');
const db = require('../db');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();
router.use(verifyToken);

// ─────────────────────────────────────────────────────────────────────
// PROJETS EBIOS
// ─────────────────────────────────────────────────────────────────────
router.get('/projects', async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT * FROM ebios_projects ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) { next(err); }
});

router.post('/projects', async (req, res, next) => {
  const { name, description, organization, scope } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO ebios_projects (name, description, organization, scope, created_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, description, organization, scope, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
});

// ─────────────────────────────────────────────────────────────────────
// ATELIER 1 — Valeurs métier
// ─────────────────────────────────────────────────────────────────────
router.get('/projects/:projectId/business-values', async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT * FROM ebios_business_values WHERE project_id = $1 ORDER BY created_at',
      [req.params.projectId]
    );
    res.json(result.rows);
  } catch (err) { next(err); }
});

router.post('/projects/:projectId/business-values', async (req, res, next) => {
  const { name, description, type, responsable } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO ebios_business_values (project_id, name, description, type, responsable)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.params.projectId, name, description, type, responsable]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
});

// ─────────────────────────────────────────────────────────────────────
// ATELIER 1 — Événements redoutés
// ─────────────────────────────────────────────────────────────────────
router.get('/projects/:projectId/feared-events', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT fe.*, bv.name AS business_value_name
       FROM ebios_feared_events fe
       JOIN ebios_business_values bv ON bv.id = fe.business_value_id
       WHERE fe.project_id = $1
       ORDER BY fe.severity DESC`,
      [req.params.projectId]
    );
    res.json(result.rows);
  } catch (err) { next(err); }
});

router.post('/projects/:projectId/feared-events', async (req, res, next) => {
  const { business_value_id, description, impact_type, severity } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO ebios_feared_events (project_id, business_value_id, description, impact_type, severity)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.params.projectId, business_value_id, description, impact_type, severity]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
});

// ─────────────────────────────────────────────────────────────────────
// ATELIER 2 — Sources de risque
// ─────────────────────────────────────────────────────────────────────
router.get('/projects/:projectId/risk-sources', async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT * FROM ebios_risk_sources WHERE project_id = $1 ORDER BY pertinence DESC',
      [req.params.projectId]
    );
    res.json(result.rows);
  } catch (err) { next(err); }
});

router.post('/projects/:projectId/risk-sources', async (req, res, next) => {
  const { name, description, category, motivation, pertinence, targeted_objectives } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO ebios_risk_sources (project_id, name, description, category, motivation, pertinence, targeted_objectives)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.params.projectId, name, description, category, motivation, pertinence, targeted_objectives]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
});

// ─────────────────────────────────────────────────────────────────────
// ATELIER 3 — Scénarios stratégiques
// ─────────────────────────────────────────────────────────────────────
router.get('/projects/:projectId/scenarios/strategic', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT ss.*,
              rs.name AS risk_source_name,
              fe.description AS feared_event_description
       FROM ebios_strategic_scenarios ss
       JOIN ebios_risk_sources rs ON rs.id = ss.risk_source_id
       JOIN ebios_feared_events fe ON fe.id = ss.feared_event_id
       WHERE ss.project_id = $1
       ORDER BY ss.likelihood DESC, ss.severity DESC`,
      [req.params.projectId]
    );
    res.json(result.rows);
  } catch (err) { next(err); }
});

router.post('/projects/:projectId/scenarios/strategic', async (req, res, next) => {
  const { risk_source_id, feared_event_id, name, description, attack_path, likelihood, severity } = req.body;

  // Calcul automatique du niveau de risque (matrice EBIOS RM)
  const computeRiskLevel = (l, s) => {
    const score = l * s;
    if (score <= 4) return 'acceptable';
    if (score <= 9) return 'tolerable';
    return 'unacceptable';
  };
  const risk_level = computeRiskLevel(likelihood, severity);

  try {
    const result = await db.query(
      `INSERT INTO ebios_strategic_scenarios
         (project_id, risk_source_id, feared_event_id, name, description, attack_path, likelihood, severity, risk_level)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [req.params.projectId, risk_source_id, feared_event_id, name, description, attack_path, likelihood, severity, risk_level]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
});

// ─────────────────────────────────────────────────────────────────────
// ATELIER 4 — Scénarios opérationnels
// ─────────────────────────────────────────────────────────────────────
router.get('/projects/:projectId/scenarios/operational', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT os.*, ss.name AS strategic_scenario_name
       FROM ebios_operational_scenarios os
       JOIN ebios_strategic_scenarios ss ON ss.id = os.strategic_scenario_id
       WHERE os.project_id = $1
       ORDER BY os.technical_likelihood DESC`,
      [req.params.projectId]
    );
    res.json(result.rows);
  } catch (err) { next(err); }
});

router.post('/projects/:projectId/scenarios/operational', async (req, res, next) => {
  const { strategic_scenario_id, name, description, attack_technique, mitre_attack_ref, targeted_asset_id, technical_likelihood } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO ebios_operational_scenarios
         (project_id, strategic_scenario_id, name, description, attack_technique, mitre_attack_ref, targeted_asset_id, technical_likelihood)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [req.params.projectId, strategic_scenario_id, name, description, attack_technique, mitre_attack_ref, targeted_asset_id, technical_likelihood]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
});

// ─────────────────────────────────────────────────────────────────────
// ATELIER 5 — Mesures de sécurité
// ─────────────────────────────────────────────────────────────────────
router.get('/projects/:projectId/measures', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT sm.*, ss.name AS scenario_name
       FROM ebios_security_measures sm
       JOIN ebios_strategic_scenarios ss ON ss.id = sm.strategic_scenario_id
       WHERE sm.project_id = $1
       ORDER BY sm.status, sm.deadline`,
      [req.params.projectId]
    );
    res.json(result.rows);
  } catch (err) { next(err); }
});

router.post('/projects/:projectId/measures', async (req, res, next) => {
  const { strategic_scenario_id, name, description, type, treatment_option, status, responsible, deadline, residual_risk_level } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO ebios_security_measures
         (project_id, strategic_scenario_id, name, description, type, treatment_option, status, responsible, deadline, residual_risk_level)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [req.params.projectId, strategic_scenario_id, name, description, type, treatment_option, status, responsible, deadline, residual_risk_level]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
});

// ─────────────────────────────────────────────────────────────────────
// RAPPORT COMPLET du projet
// ─────────────────────────────────────────────────────────────────────
router.get('/projects/:projectId/report', async (req, res, next) => {
  const { projectId } = req.params;
  try {
    const [project, businessValues, fearedEvents, riskSources, strategicScenarios, operationalScenarios, measures] =
      await Promise.all([
        db.query('SELECT * FROM ebios_projects WHERE id = $1', [projectId]),
        db.query('SELECT * FROM ebios_business_values WHERE project_id = $1', [projectId]),
        db.query('SELECT * FROM ebios_feared_events WHERE project_id = $1 ORDER BY severity DESC', [projectId]),
        db.query('SELECT * FROM ebios_risk_sources WHERE project_id = $1 ORDER BY pertinence DESC', [projectId]),
        db.query('SELECT * FROM v_risk_summary WHERE project_id = $1', [projectId]),
        db.query('SELECT * FROM ebios_operational_scenarios WHERE project_id = $1', [projectId]),
        db.query('SELECT * FROM ebios_security_measures WHERE project_id = $1', [projectId]),
      ]);

    res.json({
      project: project.rows[0],
      workshop1: { businessValues: businessValues.rows, fearedEvents: fearedEvents.rows },
      workshop2: { riskSources: riskSources.rows },
      workshop3: { strategicScenarios: strategicScenarios.rows },
      workshop4: { operationalScenarios: operationalScenarios.rows },
      workshop5: { measures: measures.rows },
      generatedAt: new Date().toISOString(),
    });
  } catch (err) { next(err); }
});

module.exports = router;
