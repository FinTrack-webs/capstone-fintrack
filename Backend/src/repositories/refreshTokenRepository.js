const db = require('../config/db');

const refreshTokenRepository = {
  /**
   * Simpan refresh token baru ke database
   */
  create: async (userId, token, expiresAt) => {
    const result = await db.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3) RETURNING *',
      [userId, token, expiresAt]
    );
    return result.rows[0];
  },

  /**
   * Cari refresh token berdasarkan token string
   */
  findByToken: async (token) => {
    const result = await db.query(
      'SELECT * FROM refresh_tokens WHERE token = $1',
      [token]
    );
    return result.rows[0] || null;
  },

  /**
   * Hapus satu refresh token (untuk logout tunggal)
   */
  deleteByToken: async (token) => {
    const result = await db.query(
      'DELETE FROM refresh_tokens WHERE token = $1 RETURNING *',
      [token]
    );
    return result.rows[0] || null;
  },

  /**
   * Hapus semua refresh token milik user (untuk logout global)
   */
  deleteAllByUserId: async (userId) => {
    const result = await db.query(
      'DELETE FROM refresh_tokens WHERE user_id = $1',
      [userId]
    );
    return result.rowCount;
  },

  /**
   * Hapus token-token yang sudah expired (housekeeping)
   */
  deleteExpired: async () => {
    const result = await db.query(
      'DELETE FROM refresh_tokens WHERE expires_at < NOW()'
    );
    return result.rowCount;
  },
};

module.exports = refreshTokenRepository;
