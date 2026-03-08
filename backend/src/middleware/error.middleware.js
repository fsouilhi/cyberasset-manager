const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ${err.stack}`);

  // Erreurs PostgreSQL
  if (err.code === '23505') {
    return res.status(409).json({ error: 'Ressource deja existante', detail: err.detail });
  }
  if (err.code === '23503') {
    return res.status(400).json({ error: 'Reference invalide', detail: err.detail });
  }
  if (err.code === '22P02') {
    return res.status(400).json({ error: 'Format UUID invalide' });
  }

  // Erreurs JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Token invalide' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expire' });
  }

  // Erreur generique
  res.status(err.status || 500).json({
    error: err.message || 'Erreur interne du serveur',
  });
};

module.exports = errorHandler;