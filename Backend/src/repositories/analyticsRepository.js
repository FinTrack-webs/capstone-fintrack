const db = require('../config/db');

const analyticsRepository = {
  /**
   * Mengambil total pengeluaran bulanan user dengan filter tanggal opsional
   * @param {string} userId
   * @param {string|null} startDate - Tanggal mulai (opsional)
   * @param {string|null} endDate - Tanggal akhir (opsional)
   */
  getMonthlyExpenses: async (userId, startDate, endDate) => {
    const conditions = ["t.user_id = $1", "c.type = 'expense'"];
    const values = [userId];
    let paramCount = 2;

    if (startDate) {
      conditions.push(`t.date >= $${paramCount++}`);
      values.push(startDate);
    }
    if (endDate) {
      conditions.push(`t.date <= $${paramCount++}`);
      values.push(endDate);
    }

    const result = await db.query(
      `SELECT 
        DATE_TRUNC('month', t.date) AS month,
        COALESCE(SUM(t.amount), 0) AS total
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE ${conditions.join(' AND ')}
       GROUP BY month
       ORDER BY month ASC`,
      values
    );
    return result.rows;
  },

  /**
   * Mengambil perbandingan pemasukan vs pengeluaran per periode (weekly/monthly)
   * @param {string} userId
   * @param {string|null} startDate
   * @param {string|null} endDate
   * @param {string} period - 'weekly' atau 'monthly'
   */
  getIncomeVsExpense: async (userId, startDate, endDate, period = 'monthly') => {
    // Validasi period - hanya izinkan 'week' atau 'month' untuk DATE_TRUNC
    const truncPeriod = period === 'weekly' ? 'week' : 'month';

    const conditions = ['t.user_id = $1'];
    const values = [userId];
    let paramCount = 2;

    if (startDate) {
      conditions.push(`t.date >= $${paramCount++}`);
      values.push(startDate);
    }
    if (endDate) {
      conditions.push(`t.date <= $${paramCount++}`);
      values.push(endDate);
    }

    const result = await db.query(
      `SELECT 
        DATE_TRUNC('${truncPeriod}', t.date) AS period_start,
        COALESCE(SUM(CASE WHEN c.type = 'income' THEN t.amount ELSE 0 END), 0) AS income,
        COALESCE(SUM(CASE WHEN c.type = 'expense' THEN t.amount ELSE 0 END), 0) AS expense
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE ${conditions.join(' AND ')}
       GROUP BY period_start
       ORDER BY period_start ASC`,
      values
    );
    return result.rows;
  },

  /**
   * Mengambil distribusi pengeluaran per kategori
   * @param {string} userId
   * @param {string|null} startDate
   * @param {string|null} endDate
   */
  getExpenseDistribution: async (userId, startDate, endDate) => {
    const conditions = ["t.user_id = $1", "c.type = 'expense'"];
    const values = [userId];
    let paramCount = 2;

    if (startDate) {
      conditions.push(`t.date >= $${paramCount++}`);
      values.push(startDate);
    }
    if (endDate) {
      conditions.push(`t.date <= $${paramCount++}`);
      values.push(endDate);
    }

    const result = await db.query(
      `SELECT 
        c.name AS category_name,
        COALESCE(SUM(t.amount), 0) AS total
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE ${conditions.join(' AND ')}
       GROUP BY c.name
       ORDER BY total DESC`,
      values
    );
    return result.rows;
  },

  /**
   * Mengambil ringkasan pemasukan dan pengeluaran bulan berjalan (untuk AI insights)
   * @param {string} userId
   */
  getCurrentMonthSummary: async (userId) => {
    const result = await db.query(
      `SELECT 
        COALESCE(SUM(CASE WHEN c.type = 'income' THEN t.amount ELSE 0 END), 0) AS total_income,
        COALESCE(SUM(CASE WHEN c.type = 'expense' THEN t.amount ELSE 0 END), 0) AS total_expense
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = $1 
         AND DATE_TRUNC('month', t.date) = DATE_TRUNC('month', CURRENT_DATE)`,
      [userId]
    );
    return result.rows[0];
  },

  /**
   * Mengambil rasio pengeluaran hiburan terhadap total pengeluaran bulan berjalan
   * @param {string} userId
   */
  getEntertainmentExpenseRatio: async (userId) => {
    const result = await db.query(
      `SELECT 
        COALESCE(SUM(CASE WHEN c.name = 'Hiburan' THEN t.amount ELSE 0 END), 0) AS entertainment_total,
        COALESCE(SUM(t.amount), 0) AS total_expense
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = $1 AND c.type = 'expense'
         AND DATE_TRUNC('month', t.date) = DATE_TRUNC('month', CURRENT_DATE)`,
      [userId]
    );
    return result.rows[0];
  },
};

module.exports = analyticsRepository;
