const transactionService = require('../services/transactionService');
const asyncHandler = require('../utils/asyncHelper');


const aiService = process.env.NODE_ENV === 'test'
  ? require('../services/aiMockService')
  : require('../services/aiService');

const transactionController = {
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

  getById: asyncHandler(async (req, res) => {
    const transaction = await transactionService.getById(req.params.id, req.user.userId);

    res.status(200).json({
      status: 'success',
      data: transaction,
    });
  }),

  create: asyncHandler(async (req, res) => {
    const transaction = await transactionService.create(req.user.userId, req.body);

    res.status(201).json({
      status: 'success',
      message: 'Transaksi berhasil dibuat',
      data: transaction,
    });
  }),

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

  delete: asyncHandler(async (req, res) => {
    await transactionService.delete(req.params.id, req.user.userId);

    res.status(200).json({
      status: 'success',
      message: 'Transaksi berhasil dihapus',
    });
  }),
};

module.exports = transactionController;