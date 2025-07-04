require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Test the connection
pool.on('connect', () => {
  console.log('Connexion à PostgreSQL réussie.');
});

pool.on('error', (err) => {
  console.error('Erreur de connexion PostgreSQL:', err);
});

module.exports = pool;