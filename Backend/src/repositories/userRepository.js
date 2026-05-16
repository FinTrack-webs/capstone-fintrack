const db = require('../config/db');

const userRepository = {
  /**
   * Mencari user berdasarkan email
   */
  findByEmail: async (email) => {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  },

  /**
   * Mencari user berdasarkan ID
   */
  findById: async (id) => {
    const result = await db.query('SELECT id, email, created_at FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  /**
   * Membuat user baru
   */
  create: async (email, passwordHash) => {
    const result = await db.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
      [email, passwordHash]
    );
    return result.rows[0];
  },
};

module.exports = userRepository;
