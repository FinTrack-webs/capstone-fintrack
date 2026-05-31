const db = require('../config/db');

const otpRepository = {
  /**
   * Menyimpan kode OTP baru ke database
   * @param {string} userId
   * @param {string} code
   * @param {Date} expiresAt
   */
  create: async (userId, code, expiresAt) => {
    const result = await db.query(
      `INSERT INTO otp_codes (user_id, code, expires_at)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, code, expiresAt]
    );
    return result.rows[0];
  },

  findActiveByEmailAndCode: async (email, code) => {
    const result = await db.query(
      `SELECT o.*, u.id as user_id, u.email
       FROM otp_codes o
       JOIN users u ON o.user_id = u.id
       WHERE u.email = $1 
         AND o.code = $2
       ORDER BY o.created_at DESC
       LIMIT 1`,
      [email, code]
    );
    return result.rows[0] || null;
  },

  /**
   * Menghapus semua kode OTP milik seorang user (misalnya setelah verifikasi berhasil)
   * @param {string} userId
   */
  deleteByUserId: async (userId) => {
    const result = await db.query(
      'DELETE FROM otp_codes WHERE user_id = $1',
      [userId]
    );
    return result.rowCount > 0;
  },
};

module.exports = otpRepository;