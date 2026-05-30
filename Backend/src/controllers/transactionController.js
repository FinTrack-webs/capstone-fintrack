const transactionService = require('../services/transactionService');
const asyncHandler = require('../utils/asyncHelper');

// Import AI service sesuai environment
const aiService = process.env.NODE_ENV === 'test'
  ? require('../services/aiMockService')
  : require('../services/aiService');

const transactionController = {
  /**
   * GET /api/transactions
   * Mendukung filter dan paginasi via query params
   */
  getAll: asyncHandler(async (req, res) => {
    const { search, category_id, type, status, start_date, end_date, page, limit } = req.query;

    const filters = {
      search,
      category_id: category_id ? parseInt(category_id, 10) : undefined,
      type,
      status,
      start_date,
      end_date,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    };

    const result = await transactionService.getAllByUser(req.user.userId, filters);

    res.status(200).json({
      status: 'success',
      data: result.data,
      pagination: result.pagination,
    });
  }),

  /**
   * GET /api/transactions/export
   * Export transaksi ke CSV
   */
  exportCsv: asyncHandler(async (req, res) => {
    const { start_date, end_date, category_id } = req.query;

    const filters = {
      start_date,
      end_date,
      category_id: category_id ? parseInt(category_id, 10) : undefined,
    };

    const csvString = await transactionService.exportCsv(req.user.userId, filters);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="transactions.csv"');
    res.send(csvString);
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
   * POST /api/transactions/predict-only
   * Preview kategori AI tanpa simpan ke DB
   */
  previewCategory: asyncHandler(async (req, res) => {
    const { description, transaction_type, account_type } = req.body;

    const result = await aiService.predictCategory(description, transaction_type, account_type);

    if (!result) {
      return res.status(503).json({
        status: 'error',
        message: 'AI service tidak tersedia',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        predicted_category: result.predicted_category,
        confidence_score: result.confidence_score,
        mapped_category: result.mapped_name,
      },
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
