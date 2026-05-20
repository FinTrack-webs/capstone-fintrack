const { Pool } = require('pg');
require('dotenv').config();

const isVercel = Boolean(process.env.VERCEL);

const pool = new Pool({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT,
  ssl: {
    rejectUnauthorized: false,
  },
  // Serverless: batasi koneksi agar tidak membebani pool Supabase
  max: isVercel ? 1 : 10,
  idleTimeoutMillis: isVercel ? 10000 : 30000,
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
