require('dotenv').config();


if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error('[FATAL]: JWT_SECRET tidak ditemukan di environment variable pada mode produksi!');
  process.exit(1);
}

const jwtConfig = {
  secret: process.env.JWT_SECRET || 'default_secret_fintrack_dev_only',
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d',
};

module.exports = jwtConfig;
