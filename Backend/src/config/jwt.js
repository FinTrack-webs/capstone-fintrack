require('dotenv').config();

const jwtConfig = {
  secret: process.env.JWT_SECRET || 'default_secret_fintrack',
  accessTokenExpiry: '15m',   // Access token berlaku 15 menit
  refreshTokenExpiry: '7d',   // Refresh token berlaku 7 hari
};

module.exports = jwtConfig;
