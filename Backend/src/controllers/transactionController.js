const transactionService = require('../services/transactionService');
const asyncHandler = require('../utils/asyncHelper');

const transactionController = {
  /**
   * GET /api/transactions
   */
  getAll: asyncHandler(async (req, res) => {
    const transactions = await transactionService.getAllByUser(req.user.userId);

    res.status(200).json({
      status: 'success',
      data: transactions,
    });
  }),

  /**
   * GET /api/transactions/:id
   */
  getById: asyncHandler(async (req, res) => {
    const transaction = await transactionService.getById(req.params.id, req.user.userId);

    res.status(200).json({
      status: 'success',
      data: transaction,
    });
  }),

  /**
   * POST /api/transactions
   */
  create: asyncHandler(async (req, res) => {
    const transaction = await transactionService.create(req.user.userId, req.body);

    res.status(201).json({
      status: 'success',
      message: 'Transaksi berhasil dibuat',
      data: transaction,
    });
  }),

  /**
   * PUT /api/transactions/:id
   */
  update: asyncHandler(async (req, res) => {
    const transaction = await transactionService.update(
      req.params.id,
      req.user.userId,
      req.body
    );

    res.status(200).json({
      status: 'success',
      message: 'Transaksi berhasil diperbarui',
      data: transaction,
    });
  }),

  /**
   * DELETE /api/transactions/:id
   */
  delete: asyncHandler(async (req, res) => {
    await transactionService.delete(req.params.id, req.user.userId);

    res.status(200).json({
      status: 'success',
      message: 'Transaksi berhasil dihapus',
    });
  }),
};

module.exports = transactionController;
