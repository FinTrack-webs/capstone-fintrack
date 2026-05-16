const transactionRepository = require('../repositories/transactionRepository');
const aiMockService = require('./aiMockService');
const logger = require('../utils/logger');

const transactionService = {
  /**
   * Ambil semua transaksi milik user
   */
  getAllByUser: async (userId) => {
    return transactionRepository.findAllByUserId(userId);
  },

  /**
   * Ambil transaksi berdasarkan ID (dengan ownership check)
   */
  getById: async (id, userId) => {
    const transaction = await transactionRepository.findByIdAndUserId(id, userId);
    if (!transaction) {
      const error = new Error('Transaksi tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }
    return transaction;
  },

  /**
   * Buat transaksi baru + trigger AI mock classification (fire-and-forget)
   */
  create: async (userId, data) => {
    const { category_id, amount, description, date } = data;

    const transaction = await transactionRepository.create(
      userId, category_id, amount, description, date
    );

    // Fire-and-Forget: AI Mock Classification
    // Jika category_id tidak disediakan, trigger auto-classification
    if (!category_id) {
      aiMockService.classify(transaction.id, description)
        .then(async (result) => {
          if (result.categoryId) {
            await transactionRepository.updateClassification(
              result.transactionId,
              result.categoryId,
              'classified'
            );
            logger.info(`[AI] Transaksi ${result.transactionId} berhasil diklasifikasi ke kategori ${result.categoryId}`);
          } else {
            await transactionRepository.updateClassification(
              result.transactionId,
              null,
              'failed'
            );
            logger.warn(`[AI] Gagal mengklasifikasi transaksi ${result.transactionId}`);
          }
        })
        .catch((err) => {
          logger.error(`[AI] Error saat klasifikasi transaksi ${transaction.id}:`, err.message);
          // Update status jadi failed
          transactionRepository.updateClassification(transaction.id, null, 'failed')
            .catch((e) => logger.error('[AI] Gagal update status failed:', e.message));
        });
    }

    return transaction;
  },

  /**
   * Update transaksi (dengan ownership check)
   */
  update: async (id, userId, fields) => {
    const transaction = await transactionRepository.update(id, userId, fields);
    if (!transaction) {
      const error = new Error('Transaksi tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }
    return transaction;
  },

  /**
   * Hapus transaksi (dengan ownership check)
   */
  delete: async (id, userId) => {
    const transaction = await transactionRepository.delete(id, userId);
    if (!transaction) {
      const error = new Error('Transaksi tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }
    return transaction;
  },
};

module.exports = transactionService;
