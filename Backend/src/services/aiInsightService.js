const analyticsRepository = require('../repositories/analyticsRepository');
const savingsGoalRepository = require('../repositories/savingsGoalRepository');

const aiInsightService = {
  /**
   * Menghitung skor kesehatan keuangan berdasarkan data bulan berjalan
   * Skor awal 100, dikurangi/ditambah berdasarkan kondisi tertentu
   * @param {string} userId
   */
  getFinancialHealthScore: async (userId) => {
    let score = 100;

    const summary = await analyticsRepository.getCurrentMonthSummary(userId);
    const totalIncome = parseInt(summary.total_income);
    const totalExpense = parseInt(summary.total_expense);

    if (totalIncome === 0 && totalExpense === 0) {
      return {
        score: 100,
        total_income: 0,
        total_expense: 0,
      };
    }

    if (totalExpense > totalIncome) score -= 30;
    if (totalIncome === 0) score -= 20;

    const ratioData = await analyticsRepository.getEntertainmentExpenseRatio(userId);
    const entertainmentTotal = parseInt(ratioData.entertainment_total);
    const totalExp = parseInt(ratioData.total_expense);
    const entertainmentRatio = totalExp > 0 ? entertainmentTotal / totalExp : 0;

    if (entertainmentRatio > 0.2) score -= 10;

    const goals = await savingsGoalRepository.findAllByUserId(userId);
    const hasGoodProgress = goals.some((g) => {
      const progress = g.target_amount > 0 ? g.current_amount / g.target_amount : 0;
      return progress > 0.5;
    });
    if (hasGoodProgress) score += 5;

    score = Math.max(0, Math.min(100, score));

    return {
      score,
      total_income: totalIncome,
      total_expense: totalExpense,
    };
  },

  /**
   * Menghasilkan insight kondisional berdasarkan data keuangan user
   * @param {string} userId
   */
  getInsights: async (userId) => {
    const insights = [];

    
    const summary = await analyticsRepository.getCurrentMonthSummary(userId);
    const totalIncome = parseInt(summary.total_income);
    const totalExpense = parseInt(summary.total_expense);

    if (totalExpense > totalIncome) {
      insights.push({
        type: 'warning',
        message: 'Pengeluaran bulan ini melebihi pemasukan. Pertimbangkan untuk mengurangi pengeluaran.',
      });
    }

    if (totalIncome > 0 && totalExpense >= totalIncome * 0.8) {
      insights.push({
        type: 'warning',
        message: 'Pengeluaran bulan ini mendekati batas pemasukan Anda.',
      });
    }

    const ratioData = await analyticsRepository.getEntertainmentExpenseRatio(userId);
    const entertainmentRatio = parseInt(ratioData.total_expense) > 0
      ? parseInt(ratioData.entertainment_total) / parseInt(ratioData.total_expense)
      : 0;

    if (entertainmentRatio > 0.2) {
      insights.push({
        type: 'tip',
        message: 'Pengeluaran hiburan Anda cukup tinggi. Hemat Rp200rb dengan mengurangi kategori Hiburan.',
        action_label: 'Lihat Rincian',
      });
    }

    if (totalIncome === 0) {
      insights.push({
        type: 'tip',
        message: 'Belum ada pemasukan tercatat bulan ini. Pastikan untuk mencatat semua sumber pemasukan Anda.',
      });
    }

    const goals = await savingsGoalRepository.findAllByUserId(userId);
    if (goals.length === 0) {
      insights.push({
        type: 'tip',
        message: 'Anda belum memiliki target tabungan. Mulai buat target untuk mengelola keuangan lebih baik!',
        action_label: 'Buat Target',
      });
    }

    if (totalIncome > totalExpense && totalIncome > 0) {
      insights.push({
        type: 'info',
        message: 'Keuangan Anda sehat bulan ini! Pertimbangkan untuk menabung selisihnya.',
      });
    }

    return insights;
  },
};

module.exports = aiInsightService;