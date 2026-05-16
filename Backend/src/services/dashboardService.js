const dashboardRepository = require('../repositories/dashboardRepository');

const dashboardService = {
  /**
   * Ambil ringkasan dashboard: total income, expense, balance, dan breakdown per kategori
   */
  getSummary: async (userId) => {
    const [totalIncome, totalExpense, breakdown] = await Promise.all([
      dashboardRepository.getTotalIncome(userId),
      dashboardRepository.getTotalExpense(userId),
      dashboardRepository.getBreakdownByCategory(userId),
    ]);

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      breakdown,
    };
  },
};

module.exports = dashboardService;
