const db = require('../config/db');

const userRepository = {

  findByEmail: async (email) => {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  },

  findById: async (id) => {
    const result = await db.query('SELECT id, email, created_at, email_verified, two_fa_enabled FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  create: async (email, passwordHash) => {
    const result = await db.query(
      'INSERT INTO users (email, password_hash, email_verified) VALUES ($1, $2, false) RETURNING id, email, created_at, email_verified',
      [email, passwordHash]
    );
    return result.rows[0];
  },

  verifyEmail: async (id) => {
    const result = await db.query(
      'UPDATE users SET email_verified = true WHERE id = $1 RETURNING id, email, email_verified',
      [id]
    );
    return result.rows[0];
  },
};

module.exports = userRepository;