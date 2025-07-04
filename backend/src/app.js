const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import du pool PostgreSQL (au lieu de sequelize)
const pool = require('./config/database');

// Import des routes
const authRoutes = require('./routes/auth');
const smsRoutes = require('./routes/sms');
const webhookRoutes = require('./routes/webhook');

// Import des middlewares
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/logger');

const app = express();

// ===========================================
// MIDDLEWARES GLOBAUX
// ===========================================

// Sécurité
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] 
    : ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || 100),
  message: 'Trop de requêtes, veuillez réessayer plus tard.'
});
app.use(limiter);

// Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(requestLogger);

// ===========================================
// ROUTES
// ===========================================

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/sms', smsRoutes);
app.use('/webhook', webhookRoutes);

// Route 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Gestionnaire d'erreurs global
app.use(errorHandler);

// ===========================================
// TEST DE CONNEXION À LA BASE DE DONNÉES
// ===========================================

async function testDatabaseConnection() {
  try {
    const client = await pool.connect();
    console.log('Connexion à PostgreSQL réussie.');
    client.release();
  } catch (err) {
    console.error('Erreur de connexion à PostgreSQL:', err);
    // Ne pas faire process.exit() ici pour permettre au serveur de continuer
  }
}

// ===========================================
// DÉMARRAGE DU SERVEUR
// ===========================================

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Test de la connexion DB
    await testDatabaseConnection();
    
    // Démarrage du serveur
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`📱 Mode: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Erreur lors du démarrage du serveur:', error);
  }
}

startServer();

// Gestion propre de l'arrêt
process.on('SIGTERM', async () => {
  console.log('👋 Arrêt du serveur...');
  try {
    await pool.end();
    console.log('✅ Connexions à la base de données fermées.');
  } catch (error) {
    console.error('❌ Erreur lors de la fermeture:', error);
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n🔴 Arrêt du serveur en cours...');
  try {
    await pool.end();
    console.log('✅ Connexions à la base de données fermées.');
  } catch (error) {
    console.error('❌ Erreur lors de la fermeture:', error);
  }
  process.exit(0);
});