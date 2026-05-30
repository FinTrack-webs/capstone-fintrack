const analyticsRepository = require('../repositories/analyticsRepository');

// Daftar singkatan bulan untuk label periode bulanan
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const analyticsService = {
  /**
   * Mengambil data pengeluaran bulanan dengan format response
   * @param {string} userId
   * @param {string|null} startDate
   * @param {string|null} endDate
   */
  getMonthlyExpenses: async (userId, startDate, endDate) => {
    const rows = await analyticsRepository.getMonthlyExpenses(userId, startDate, endDate);

    return rows.map((row) => ({
      month: row.month,
      total: parseInt(row.total),
      budget: null, // Belum ada tabel budget
    }));
  },

  /**
   * Mengambil perbandingan pemasukan vs pengeluaran dengan label yang sesuai
   * @param {string} userId
   * @param {string|null} startDate
   * @param {string|null} endDate
   * @param {string} period - 'weekly' atau 'monthly'
   */
  getIncomeVsExpense: async (userId, startDate, endDate, period = 'monthly') => {
    // Validasi period
    const validPeriods = ['weekly', 'monthly'];
    if (!validPeriods.includes(period)) {
      const error = new Error('Period harus "weekly" atau "monthly"');
      error.statusCode = 400;
      throw error;
    }

    const rows = await analyticsRepository.getIncomeVsExpense(userId, startDate, endDate, period);

    return rows.map((row) => {
      let label;
      const date = new Date(row.period_start);

      if (period === 'monthly') {
        // Format label bulan: "Jan", "Feb", dst.
        label = MONTH_LABELS[date.getMonth()];
      } else {
        // Format label mingguan: tanggal string ISO
        label = date.toISOString().split('T')[0];
      }

      return {
        label,
        income: parseInt(row.income),
        expense: parseInt(row.expense),
      };
    });
  },

  /**
   * Mengambil distribusi pengeluaran per kategori dengan persentase
   * @param {string} userId
   * @param {string|null} startDate
   * @param {string|null} endDate
   */
  getExpenseDistribution: async (userId, startDate, endDate) => {
    const rows = await analyticsRepository.getExpenseDistribution(userId, startDate, endDate);

    // Hitung grand total untuk kalkulasi persentase
    const grandTotal = rows.reduce((sum, row) => sum + parseInt(row.total), 0);

    return rows.map((row) => {
      const total = parseInt(row.total);
      const percentage = grandTotal > 0 ? Math.round((total / grandTotal) * 100) : 0;

      return {
        category_name: row.category_name,
        total,
        percentage,
      };
    });
  },
};

module.exports = analyticsService;
