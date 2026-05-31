const dashboardService = require('../services/dashboardService');
const asyncHandler = require('../utils/asyncHelper');

const dashboardController = {

  getSummary: asyncHandler(async (req, res) => {
    const summary = await dashboardService.getSummary(req.user.userId);

    res.status(200).json({
      status: 'success',
      data: summary,
    });
  }),
};

module.exports = dashboardController;