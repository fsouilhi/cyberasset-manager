const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const validate = require('../middleware/validate.middleware');
const { registerSchema, loginSchema } = require('../middleware/schemas');

const router = express.Router();

const generateTokens = (user) => {
  const payload = { id: user.id, email: user.email, role: user.role };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const { email, password, first_name, last_name } = req.body;
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    const hash = await bcrypt.hash(password, 12);
    const result = await db.query(
      `INSERT INTO users (email, password, first_name, last_name)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, first_name, last_name, role, created_at`,
      [email, hash, first_name, last_name]
    );
    const user = result.rows[0];
    const tokens = generateTokens(user);
    res.status(201).json({ user, ...tokens });
  } catch (err) {
    next(err);
  }
});

router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const { password: _, ...userWithoutPassword } = user;
    const tokens = generateTokens(user);
    res.json({ user: userWithoutPassword, ...tokens });
  } catch (err) {
    next(err);
  }
});

router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: 'Refresh token required' });
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const accessToken = jwt.sign(
      { id: decoded.id, email: decoded.email, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    res.json({ accessToken });
  } catch {
    res.status(403).json({ error: 'Invalid refresh token' });
  }
});

module.exports = router;