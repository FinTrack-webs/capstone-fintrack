const db = require('../config/db');

const userProfileRepository = {
  /**
   * Mengambil profil user berdasarkan ID (tanpa password_hash)
   * @param {string} userId
   */
  findById: async (userId) => {
    const result = await db.query(
      `SELECT id, email, full_name, phone, address, avatar_url, two_fa_enabled, created_at
       FROM users
       WHERE id = $1`,
      [userId]
    );
    return result.rows[0] || null;
  },

  /**
   * Mengambil user berdasarkan ID termasuk password_hash (untuk verifikasi)
   * @param {string} userId
   */
  findByIdWithPassword: async (userId) => {
    const result = await db.query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );
    return result.rows[0] || null;
  },

  /**
   * Update profil user (full_name, phone, address) secara dinamis
   * Hanya field yang diberikan yang akan di-update
   * @param {string} userId
   * @param {object} data - { full_name, phone, address }
   */
  updateProfile: async (userId, data) => {
    const setClauses = [];
    const values = [];
    let paramCount = 1;

    if (data.full_name !== undefined) {
      setClauses.push(`full_name = $${paramCount++}`);
      values.push(data.full_name);
    }
    if (data.phone !== undefined) {
      setClauses.push(`phone = $${paramCount++}`);
      values.push(data.phone);
    }
    if (data.address !== undefined) {
      setClauses.push(`address = $${paramCount++}`);
      values.push(data.address);
    }

    if (setClauses.length === 0) return null;

    values.push(userId);
    const query = `UPDATE users SET ${setClauses.join(', ')}
       WHERE id = $${paramCount}
       RETURNING id, email, full_name, phone, address, avatar_url, two_fa_enabled, created_at`;

    const result = await db.query(query, values);
    return result.rows[0] || null;
  },

  /**
   * Update password user
   * @param {string} userId
   * @param {string} passwordHash - Hash password baru
   */
  updatePassword: async (userId, passwordHash) => {
    const result = await db.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [passwordHash, userId]
    );
    return result.rowCount > 0;
  },

  /**
   * Update avatar URL user
   * @param {string} userId
   * @param {string} avatarUrl
   */
  updateAvatar: async (userId, avatarUrl) => {
    const result = await db.query(
      `UPDATE users SET avatar_url = $1
       WHERE id = $2
       RETURNING id, email, full_name, phone, address, avatar_url, two_fa_enabled, created_at`,
      [avatarUrl, userId]
    );
    return result.rows[0] || null;
  },

  /**
   * Toggle pengaturan 2FA user
   * @param {string} userId
   * @param {boolean} enabled
   */
  toggle2fa: async (userId, enabled) => {
    const result = await db.query(
      `UPDATE users SET two_fa_enabled = $1
       WHERE id = $2
       RETURNING id, email, full_name, phone, address, avatar_url, two_fa_enabled, created_at`,
      [enabled, userId]
    );
    return result.rows[0] || null;
  },
};

module.exports = userProfileRepository;
