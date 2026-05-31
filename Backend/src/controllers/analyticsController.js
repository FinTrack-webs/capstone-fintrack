const analyticsService = require('../services/analyticsService');
const asyncHandler = require('../utils/asyncHelper');

const analyticsController = {

  getMonthlyExpenses: asyncHandler(async (req, res) => {
    const { start_date, end_date } = req.query;

    const data = await analyticsService.getMonthlyExpenses(
      req.user.userId,
      start_date || null,
      end_date || null
    );

    res.status(200).json({
      status: 'success',
      data,
    });
  }),

  getIncomeVsExpense: asyncHandler(async (req, res) => {
    const { start_date, end_date, period } = req.query;
    const selectedPeriod = period || 'monthly';

    const data = await analyticsService.getIncomeVsExpense(
      req.user.userId,
      start_date || null,
      end_date || null,
      selectedPeriod
    );

    res.status(200).json({
      status: 'success',
      period: selectedPeriod,
      data,
    });
  }),

  getExpenseDistribution: asyncHandler(async (req, res) => {
    const { start_date, end_date } = req.query;

    const data = await analyticsService.getExpenseDistribution(
      req.user.userId,
      start_date || null,
      end_date || null
    );

    res.status(200).json({
      status: 'success',
      data,
    });
  }),
};

module.exports = analyticsController;