require('dotenv').config();
const rateLimit = require('express-rate-limit');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/auth.routes');
const assetsRoutes = require('./routes/assets.routes');
const ebiosRoutes = require('./routes/ebios.routes');

const app = express();
const PORT = process.env.PORT || 4000;

// ── Middlewares globaux ──────────────────────────────────────────────
app.use(helmet());
app.use(cors({
origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'https://cyberasset-manager.vercel.app'],  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());

// ── Routes ───────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Trop de tentatives, réessayez dans 15 minutes.' },
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Trop de requêtes, réessayez dans 15 minutes.' },
});

app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);
app.use('/api/auth',   authRoutes);
app.use('/api/assets', assetsRoutes);
app.use('/api/ebios',  ebiosRoutes);

// ── Health check ─────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Gestion des erreurs ───────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`CyberAsset Manager API running on port ${PORT}`);
  });
}

module.exports = app;