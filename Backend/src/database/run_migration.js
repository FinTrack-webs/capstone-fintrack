const db = require('../config/db');
const fs = require('fs');
const path = require('path');

const run = async () => {
  try {
    console.log('[migration]: Memulai migrasi tabel otp_codes...');
    const sqlPath = path.join(__dirname, 'otp_migration.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await db.query(sql);
    console.log('[migration]: Tabel otp_codes berhasil dibuat / dimigrasikan!');
    process.exit(0);
  } catch (err) {
    console.error('[migration]: Gagal menjalankan migrasi:', err.message);
    process.exit(1);
  }
};

run();
