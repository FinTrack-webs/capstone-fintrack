const savingsGoalService = require('../services/savingsGoalService');
const asyncHandler = require('../utils/asyncHelper');

const savingsGoalController = {

  getAll: asyncHandler(async (req, res) => {
    const data = await savingsGoalService.getAll(req.user.userId);

    res.status(200).json({
      status: 'success',
      message: 'Daftar target tabungan berhasil diambil',
      data,
    });
  }),

  getById: asyncHandler(async (req, res) => {
    const data = await savingsGoalService.getById(req.user.userId, req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Detail target tabungan berhasil diambil',
      data,
    });
  }),

  create: asyncHandler(async (req, res) => {
    const data = await savingsGoalService.create(req.user.userId, req.body);

    res.status(201).json({
      status: 'success',
      message: 'Target tabungan berhasil dibuat',
      data,
    });
  }),

  update: asyncHandler(async (req, res) => {
    const data = await savingsGoalService.update(req.user.userId, req.params.id, req.body);

    res.status(200).json({
      status: 'success',
      message: 'Target tabungan berhasil diperbarui',
      data,
    });
  }),

  remove: asyncHandler(async (req, res) => {
    await savingsGoalService.remove(req.user.userId, req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Target tabungan berhasil dihapus',
    });
  }),
};

module.exports = savingsGoalController;