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

    // 1. Ambil ringkasan pemasukan vs pengeluaran bulan ini
    const summary = await analyticsRepository.getCurrentMonthSummary(userId);
    const totalIncome = parseInt(summary.total_income);
    const totalExpense = parseInt(summary.total_expense);

    // Jika total pengeluaran > total pemasukan → kurangi 30
    if (totalExpense > totalIncome) score -= 30;

    // Jika tidak ada transaksi pemasukan bulan ini → kurangi 20
    if (totalIncome === 0) score -= 20;

    // 2. Cek rasio pengeluaran hiburan
    const ratioData = await analyticsRepository.getEntertainmentExpenseRatio(userId);
    const entertainmentTotal = parseInt(ratioData.entertainment_total);
    const totalExp = parseInt(ratioData.total_expense);
    const entertainmentRatio = totalExp > 0 ? entertainmentTotal / totalExp : 0;

    // Jika Hiburan > 20% dari total pengeluaran → kurangi 10
    if (entertainmentRatio > 0.2) score -= 10;

    // 3. Cek progress target tabungan
    const goals = await savingsGoalRepository.findAllByUserId(userId);
    const hasGoodProgress = goals.some((g) => {
      const progress = g.target_amount > 0 ? g.current_amount / g.target_amount : 0;
      return progress > 0.5;
    });
    if (hasGoodProgress) score += 5;

    // Clamp skor antara 0 - 100
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

    // Ambil ringkasan bulan berjalan
    const summary = await analyticsRepository.getCurrentMonthSummary(userId);
    const totalIncome = parseInt(summary.total_income);
    const totalExpense = parseInt(summary.total_expense);

    // Peringatan: pengeluaran melebihi pemasukan
    if (totalExpense > totalIncome) {
      insights.push({
        type: 'warning',
        message: 'Pengeluaran bulan ini melebihi pemasukan. Pertimbangkan untuk mengurangi pengeluaran.',
      });
    }

    // Peringatan: pengeluaran mendekati batas pemasukan (>= 80%)
    if (totalIncome > 0 && totalExpense >= totalIncome * 0.8) {
      insights.push({
        type: 'warning',
        message: 'Pengeluaran bulan ini mendekati batas pemasukan Anda.',
      });
    }

    // Cek rasio pengeluaran hiburan
    const ratioData = await analyticsRepository.getEntertainmentExpenseRatio(userId);
    const entertainmentRatio = parseInt(ratioData.total_expense) > 0
      ? parseInt(ratioData.entertainment_total) / parseInt(ratioData.total_expense)
      : 0;

    // Tips: pengeluaran hiburan terlalu tinggi (> 20%)
    if (entertainmentRatio > 0.2) {
      insights.push({
        type: 'tip',
        message: 'Pengeluaran hiburan Anda cukup tinggi. Hemat Rp200rb dengan mengurangi kategori Hiburan.',
        action_label: 'Lihat Rincian',
      });
    }

    // Tips: belum ada pemasukan tercatat bulan ini
    if (totalIncome === 0) {
      insights.push({
        type: 'tip',
        message: 'Belum ada pemasukan tercatat bulan ini. Pastikan untuk mencatat semua sumber pemasukan Anda.',
      });
    }

    // Cek target tabungan
    const goals = await savingsGoalRepository.findAllByUserId(userId);
    if (goals.length === 0) {
      insights.push({
        type: 'tip',
        message: 'Anda belum memiliki target tabungan. Mulai buat target untuk mengelola keuangan lebih baik!',
        action_label: 'Buat Target',
      });
    }

    // Info: keuangan sehat
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
