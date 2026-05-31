const { Pool } = require('pg');
require('dotenv').config();

const isVercel = Boolean(process.env.VERCEL || process.env.NOW_REGION);

const poolConfig = {
  connectionString: process.env.DATABASE_URL, 
  ssl: {
    rejectUnauthorized: false,
  },
  max: isVercel ? 1 : 10,
  idleTimeoutMillis: isVercel ? 10000 : 30000,
};

if (!poolConfig.connectionString) {
  poolConfig.user = process.env.DATABASE_USER;
  poolConfig.host = process.env.DATABASE_HOST;
  poolConfig.database = process.env.DATABASE_NAME;
  poolConfig.password = process.env.DATABASE_PASSWORD;
  poolConfig.port = process.env.DATABASE_PORT;
}

const pool = new Pool(poolConfig);

const requiredEnv = poolConfig.connectionString 
  ? [] 
  : ['DATABASE_USER', 'DATABASE_HOST', 'DATABASE_NAME', 'DATABASE_PASSWORD', 'DATABASE_PORT'];

const missingEnv = requiredEnv.filter(env => !process.env[env]);

if (!poolConfig.connectionString && missingEnv.length > 0) {
  console.error(`[database]: Konfigurasi database tidak lengkap. Missing: ${missingEnv.join(', ')}`);
}

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