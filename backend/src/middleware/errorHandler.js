const errorHandler = (err, req, res, next) => {
    console.error('Erreur serveur:', err);
  
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Données invalides',
        details: err.details
      });
    }
  
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token invalide' });
    }
  
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Cette ressource existe déjà' });
    }
  
    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
    });
  };
  
  module.exports = errorHandler;
  