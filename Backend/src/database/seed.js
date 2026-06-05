require('dotenv').config();
const { Pool } = require('pg');
const logger = require('../utils/logger');

const pool = new Pool({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT,
  ssl: { rejectUnauthorized: false },
});

const DEFAULT_CATEGORIES = [
  { name: 'Gaji', type: 'income' },
  { name: 'Freelance', type: 'income' },
  { name: 'Investasi', type: 'income' },
  { name: 'Bonus', type: 'income' },
  { name: 'Makanan', type: 'expense' },
  { name: 'Transportasi', type: 'expense' },
  { name: 'Utilitas', type: 'expense' },
  { name: 'Belanja', type: 'expense' },
  { name: 'Hiburan', type: 'expense' },
  { name: 'Kesehatan', type: 'expense' },
  { name: 'Pendidikan', type: 'expense' },
  { name: 'Tempat Tinggal', type: 'expense' },
  { name: 'Lainnya', type: 'expense' },
];

const seed = async () => {
  const client = await pool.connect();
  try {
    logger.info('Memulai seeding kategori default...');

    let inserted = 0;
    let skipped = 0;

    for (const cat of DEFAULT_CATEGORIES) {
      const existing = await client.query(
        'SELECT id FROM categories WHERE name = $1 AND type = $2',
        [cat.name, cat.type]
      );

      if (existing.rows.length === 0) {
        await client.query(
          'INSERT INTO categories (name, type) VALUES ($1, $2)',
          [cat.name, cat.type]
        );
        inserted++;
        logger.info(`Inserted: ${cat.name} (${cat.type})`);
      } else {
        skipped++;
        logger.info(`Skipped (sudah ada): ${cat.name} (${cat.type})`);
      }
    }

    logger.info(`Seeding selesai! Inserted: ${inserted}, Skipped: ${skipped}`);
  } catch (err) {
    logger.error('Seeding gagal:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

seed();
