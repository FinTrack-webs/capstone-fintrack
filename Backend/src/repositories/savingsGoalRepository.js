const db = require('../config/db');

const savingsGoalRepository = {
  /**
   * Mengambil semua target tabungan milik user
   * @param {string} userId
   */
  findAllByUserId: async (userId) => {
    const result = await db.query(
      'SELECT * FROM savings_goals WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  },

  /**
   * Mencari target tabungan berdasarkan ID dan user_id (ownership check)
   * @param {string} id
   * @param {string} userId
   */
  findByIdAndUserId: async (id, userId) => {
    const result = await db.query(
      'SELECT * FROM savings_goals WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return result.rows[0] || null;
  },

  /**
   * Membuat target tabungan baru
   * @param {string} userId
   * @param {object} data - { name, target_amount, current_amount }
   */
  create: async (userId, data) => {
    const { name, target_amount, current_amount = 0 } = data;
    const result = await db.query(
      `INSERT INTO savings_goals (user_id, name, target_amount, current_amount)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, name, target_amount, current_amount]
    );
    return result.rows[0];
  },

  /**
   * Update target tabungan secara dinamis
   * Hanya field yang diberikan yang akan di-update
   * @param {string} id
   * @param {object} data - { name, target_amount, current_amount }
   */
  update: async (id, data) => {
    const setClauses = [];
    const values = [];
    let paramCount = 1;

    if (data.name !== undefined) {
      setClauses.push(`name = $${paramCount++}`);
      values.push(data.name);
    }
    if (data.target_amount !== undefined) {
      setClauses.push(`target_amount = $${paramCount++}`);
      values.push(data.target_amount);
    }
    if (data.current_amount !== undefined) {
      setClauses.push(`current_amount = $${paramCount++}`);
      values.push(data.current_amount);
    }

    if (setClauses.length === 0) return null;

    setClauses.push('updated_at = NOW()');

    values.push(id);
    const query = `UPDATE savings_goals SET ${setClauses.join(', ')} WHERE id = $${paramCount} RETURNING *`;

    const result = await db.query(query, values);
    return result.rows[0] || null;
  },

  /**
   * Hapus target tabungan
   * @param {string} id
   */
  remove: async (id) => {
    const result = await db.query(
      'DELETE FROM savings_goals WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Mengambil semua target tabungan dengan progress (digunakan oleh AI insights)
   * @param {string} userId
   */
  findGoalsWithProgress: async (userId) => {
    const result = await db.query(
      'SELECT * FROM savings_goals WHERE user_id = $1',
      [userId]
    );
    return result.rows;
  },
};

module.exports = savingsGoalRepository;