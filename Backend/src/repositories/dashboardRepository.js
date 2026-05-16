const db = require('../config/db');

const dashboardRepository = {
  /**
   * Total income user
   */
  getTotalIncome: async (userId) => {
    const result = await db.query(
      `SELECT COALESCE(SUM(t.amount), 0) AS total_income
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = $1 AND c.type = 'income'`,
      [userId]
    );
    return parseInt(result.rows[0].total_income, 10);
  },

  /**
   * Total expense user
   */
  getTotalExpense: async (userId) => {
    const result = await db.query(
      `SELECT COALESCE(SUM(t.amount), 0) AS total_expense
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = $1 AND c.type = 'expense'`,
      [userId]
    );
    return parseInt(result.rows[0].total_expense, 10);
  },

  /**
   * Breakdown per kategori
   */
  getBreakdownByCategory: async (userId) => {
    const result = await db.query(
      `SELECT c.id AS category_id, c.name AS category_name, c.type AS category_type,
              COALESCE(SUM(t.amount), 0) AS total_amount,
              COUNT(t.id) AS transaction_count
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = $1
       GROUP BY c.id, c.name, c.type
       ORDER BY total_amount DESC`,
      [userId]
    );
    return result.rows;
  },
};

module.exports = dashboardRepository;
