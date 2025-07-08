require('dotenv-safe').config({
  allowEmptyValues: false,
  example: '.env.example'
});
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // si besoin pour Render
  }
});


module.exports = pool;
