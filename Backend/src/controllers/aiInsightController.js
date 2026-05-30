const aiInsightService = require('../services/aiInsightService');
const asyncHandler = require('../utils/asyncHelper');

const aiInsightController = {
  /**
   * GET /api/ai/insights
   * Mengambil insight keuangan berbasis AI
   */
  getInsights: asyncHandler(async (req, res) => {
    const insights = await aiInsightService.getInsights(req.user.userId);

    res.status(200).json({
      status: 'success',
      data: insights,
    });
  }),

  /**
   * GET /api/ai/financial-health-score
   * Mengambil skor kesehatan keuangan
   */
  getFinancialHealthScore: asyncHandler(async (req, res) => {
    const result = await aiInsightService.getFinancialHealthScore(req.user.userId);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  }),
};

module.exports = aiInsightController;
