const db = require('../config/db');

const transactionRepository = {
  /**
   * Mengambil semua transaksi milik user tertentu
   * @param {string} userId
   * @param {object} filters - Opsional: { account_type, classification_status }
   */
  findAllByUserId: async (userId, filters = {}) => {
    const conditions = ['t.user_id = $1'];
    const values = [userId];
    let paramCount = 2;

    if (filters.account_type) {
      conditions.push(`t.account_type = $${paramCount++}`);
      values.push(filters.account_type);
    }
    if (filters.classification_status) {
      conditions.push(`t.classification_status = $${paramCount++}`);
      values.push(filters.classification_status);
    }

    const result = await db.query(
      `SELECT t.*, c.name AS category_name, c.type AS category_type
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE ${conditions.join(' AND ')}
       ORDER BY t.date DESC, t.created_at DESC`,
      values
    );
    return result.rows;
  },

  /**
   * Mencari transaksi berdasarkan ID dan user_id (ownership check)
   */
  findByIdAndUserId: async (id, userId) => {
    const result = await db.query(
      `SELECT t.*, c.name AS category_name, c.type AS category_type
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.id = $1 AND t.user_id = $2`,
      [id, userId]
    );
    return result.rows[0] || null;
  },

  /**
   * Membuat transaksi baru
   */
  create: async (userId, categoryId, amount, description, date, accountType = 'personal') => {
    const result = await db.query(
      `INSERT INTO transactions (user_id, category_id, amount, description, date, classification_status, account_type)
       VALUES ($1, $2, $3, $4, $5, 'pending', $6)
       RETURNING *`,
      [userId, categoryId || null, amount, description, date, accountType]
    );
    return result.rows[0];
  },

  /**
   * Update transaksi
   */
  update: async (id, userId, fields) => {
    const setClauses = [];
    const values = [];
    let paramCount = 1;

    if (fields.category_id !== undefined) {
      setClauses.push(`category_id = $${paramCount++}`);
      values.push(fields.category_id);
    }
    if (fields.amount !== undefined) {
      setClauses.push(`amount = $${paramCount++}`);
      values.push(fields.amount);
    }
    if (fields.description !== undefined) {
      setClauses.push(`description = $${paramCount++}`);
      values.push(fields.description);
    }
    if (fields.date !== undefined) {
      setClauses.push(`date = $${paramCount++}`);
      values.push(fields.date);
    }

    values.push(id, userId);
    const query = `UPDATE transactions SET ${setClauses.join(', ')} WHERE id = $${paramCount++} AND user_id = $${paramCount} RETURNING *`;
    const result = await db.query(query, values);
    return result.rows[0] || null;
  },

  /**
   * Hapus transaksi
   */
  delete: async (id, userId) => {
    const result = await db.query(
      'DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );
    return result.rows[0] || null;
  },

  /**
   * Update classification status setelah AI classify
   * @param {string} transactionId
   * @param {object} data - { categoryId, aiConfidence, status }
   */
  updateClassification: async (transactionId, data) => {
    const { categoryId = null, aiConfidence = null, status } = data;
    const result = await db.query(
      `UPDATE transactions
       SET category_id = $1, ai_confidence = $2, classification_status = $3
       WHERE id = $4
       RETURNING *`,
      [categoryId, aiConfidence, status, transactionId]
    );
    return result.rows[0] || null;
  },
};

module.exports = transactionRepository;
