const db = require('../config/db');

const refreshTokenRepository = {

  //simpan refresh token baru ke database
  create: async (userId, token, expiresAt) => {
    const result = await db.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3) RETURNING *',
      [userId, token, expiresAt]
    );
    return result.rows[0];
  },

  //cari refresh token berdasarkan token string
  findByToken: async (token) => {
    const result = await db.query(
      'SELECT * FROM refresh_tokens WHERE token = $1',
      [token]
    );
    return result.rows[0] || null;
  },

  //hapus satu refresh token (untuk logout)
  deleteByToken: async (token) => {
    const result = await db.query(
      'DELETE FROM refresh_tokens WHERE token = $1 RETURNING *',
      [token]
    );
    return result.rows[0] || null;
  },

  //hapus semua refresh token milik user (untuk logout semua)
  deleteAllByUserId: async (userId) => {
    const result = await db.query(
      'DELETE FROM refresh_tokens WHERE user_id = $1',
      [userId]
    );
    return result.rowCount;
  },

  //hapus token-token yang sudah expired (housekeeping)
  deleteExpired: async () => {
    const result = await db.query(
      'DELETE FROM refresh_tokens WHERE expires_at < NOW()'
    );
    return result.rowCount;
  },
};

module.exports = refreshTokenRepository;
