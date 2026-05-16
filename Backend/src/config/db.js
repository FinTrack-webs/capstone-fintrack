const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Test koneksi database saat startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('[database]: Koneksi ke database PostgreSQL gagal!', err.message);
  } else {
    console.log('[database]: Koneksi ke database PostgreSQL berhasil!');
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
