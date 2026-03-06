const express = require('express');
const Joi = require('joi');
const db = require('../db');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();

// Toutes les routes nécessitent un JWT valide
router.use(verifyToken);

const assetSchema = Joi.object({
  name:        Joi.string().max(255).required(),
  description: Joi.string().allow(''),
  type:        Joi.string().valid('server','workstation','network','application','database','cloud','iot','other').required(),
  ip_address:  Joi.string().ip({ version: ['ipv4', 'ipv6'] }).allow('', null),
  hostname:    Joi.string().max(255).allow('', null),
  os:          Joi.string().max(100).allow('', null),
  owner:       Joi.string().max(255).allow('', null),
  location:    Joi.string().max(255).allow('', null),
  criticality: Joi.number().integer().min(1).max(4),
  status:      Joi.string().valid('active', 'inactive', 'decommissioned'),
  tags:        Joi.array().items(Joi.string()),
});

// GET /api/assets
router.get('/', async (req, res, next) => {
  try {
    const { type, criticality, status, search } = req.query;
    let query = 'SELECT * FROM assets WHERE 1=1';
    const params = [];

    if (type) { params.push(type); query += ` AND type = $${params.length}`; }
    if (criticality) { params.push(criticality); query += ` AND criticality = $${params.length}`; }
    if (status) { params.push(status); query += ` AND status = $${params.length}`; }
    if (search) { params.push(`%${search}%`); query += ` AND (name ILIKE $${params.length} OR hostname ILIKE $${params.length})`; }

    query += ' ORDER BY criticality DESC, created_at DESC';
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/assets/:id
router.get('/:id', async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM assets WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Asset not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/assets
router.post('/', async (req, res, next) => {
  const { error, value } = assetSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const result = await db.query(
      `INSERT INTO assets (name, description, type, ip_address, hostname, os, owner, location, criticality, status, tags, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [value.name, value.description, value.type, value.ip_address, value.hostname,
       value.os, value.owner, value.location, value.criticality || 2, value.status || 'active',
       value.tags || [], req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/assets/:id
router.put('/:id', async (req, res, next) => {
  const { error, value } = assetSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const result = await db.query(
      `UPDATE assets SET name=$1, description=$2, type=$3, ip_address=$4, hostname=$5,
       os=$6, owner=$7, location=$8, criticality=$9, status=$10, tags=$11, updated_at=NOW()
       WHERE id = $12 RETURNING *`,
      [value.name, value.description, value.type, value.ip_address, value.hostname,
       value.os, value.owner, value.location, value.criticality, value.status, value.tags, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Asset not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/assets/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await db.query('DELETE FROM assets WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Asset not found' });
    res.json({ message: 'Asset deleted', id: req.params.id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
