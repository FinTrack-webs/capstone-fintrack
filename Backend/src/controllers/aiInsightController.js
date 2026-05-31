const aiInsightService = require('../services/aiInsightService');
const asyncHandler = require('../utils/asyncHelper');

const aiInsightController = {
  getInsights: asyncHandler(async (req, res) => {
    const insights = await aiInsightService.getInsights(req.user.userId);

    res.status(200).json({
      status: 'success',
      data: insights,
    });
  }),

  getFinancialHealthScore: asyncHandler(async (req, res) => {
    const result = await aiInsightService.getFinancialHealthScore(req.user.userId);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  }),
};

module.exports = aiInsightController;