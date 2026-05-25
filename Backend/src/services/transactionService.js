const transactionRepository = require('../repositories/transactionRepository');
const categoryRepository = require('../repositories/categoryRepository');
const logger = require('../utils/logger');

// Import AI service sesuai environment
const aiService = process.env.NODE_ENV === 'test'
  ? require('./aiMockService')
  : require('./aiService');

/**
 * Background process (fire-and-forget) — klasifikasi transaksi dengan AI
 */
const classifyInBackground = async (transactionId, description, transactionType, accountType) => {
  try {
    // 1. Panggil FinTrack AI
    const aiResult = await aiService.predictCategory(description, transactionType, accountType);

    if (!aiResult) {
      // AI gagal → set status failed
      await transactionRepository.updateClassification(transactionId, {
        categoryId: null,
        aiConfidence: null,
        status: 'failed',
      });
      return;
    }

    // 2. Cari category_id dari nama yang sudah di-mapping
    const category = await categoryRepository.findByName(aiResult.mapped_name);
    const categoryId = category?.id ?? null;

    // 3. Update transaksi
    await transactionRepository.updateClassification(transactionId, {
      categoryId,
      aiConfidence: aiResult.confidence_score,
      status: categoryId ? 'classified' : 'failed',
    });

    logger.info(`[AI] Transaksi ${transactionId} berhasil diklasifikasi → kategori ${categoryId}`);
  } catch (err) {
    logger.error(`[classifyInBackground] transactionId=${transactionId}`, err.message);
    await transactionRepository.updateClassification(transactionId, {
      categoryId: null, aiConfidence: null, status: 'failed',
    });
  }
};

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
   * Buat transaksi baru + trigger AI classification (fire-and-forget)
   */
  create: async (userId, data) => {
    const { category_id, amount, description, date, account_type = 'personal', transaction_type } = data;

    const transaction = await transactionRepository.create(
      userId, category_id, amount, description, date, account_type
    );

    // Fire-and-Forget: AI Classification
    // Jika category_id tidak disediakan, trigger auto-classification
    if (!category_id) {
      classifyInBackground(transaction.id, description, transaction_type, account_type)
        .catch((err) => {
          logger.error(`[AI] Error fatal saat klasifikasi transaksi ${transaction.id}:`, err.message);
        });
    }

    return transaction;
  },

  /**
   * Preview kategori tanpa simpan ke DB
   */
  previewCategory: async (description, transactionType, accountType) => {
    return aiService.predictCategory(description, transactionType, accountType);
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
