const transactionRepository = require('../repositories/transactionRepository');
const categoryRepository = require('../repositories/categoryRepository');
const logger = require('../utils/logger');

// Import AI service sesuai environment
const aiService = process.env.NODE_ENV === 'test'
  ? require('./aiMockService')
  : require('./aiService');

// Klasifikasi transaksi secara background (fire-and-forget)
const classifyInBackground = async (transactionId, description, transactionType, accountType) => {
  try {
    // Panggil FinTrack AI
    const aiResult = await aiService.predictCategory(description, transactionType, accountType);

    if (!aiResult) {
      // set status failed
      await transactionRepository.updateClassification(transactionId, {
        categoryId: null,
        aiConfidence: null,
        status: 'failed',
      });
      return;
    }

    // Cari category_id dari nama yang sudah di-mapping
    const category = await categoryRepository.findByName(aiResult.mapped_name);
    const categoryId = category?.id ?? null;

    // Update transaksi
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
   * Ambil semua transaksi milik user dengan filter dan paginasi
   * @param {string} userId
   * @param {object} filters - { search, category_id, type, status, start_date, end_date, page, limit }
   * @returns {{ data: Array, pagination: object }}
   */
  getAllByUser: async (userId, filters = {}) => {
    const page = Math.max(parseInt(filters.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(filters.limit, 10) || 10, 1), 100);
    const offset = (page - 1) * limit;

    const repoFilters = {
      ...filters,
      limit,
      offset,
    };

    const { rows, total } = await transactionRepository.findAllByUserId(userId, repoFilters);

    return {
      data: rows,
      pagination: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      },
    };
  },

  // Ambil transaksi berdasarkan ID (dengan ownership check)
  getById: async (id, userId) => {
    const transaction = await transactionRepository.findByIdAndUserId(id, userId);
    if (!transaction) {
      const error = new Error('Transaksi tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }
    return transaction;
  },

  // Buat transaksi baru + trigger AI classification (fire-and-forget)
  create: async (userId, data) => {
    const { category_id, amount, description, date, account_type = 'personal', transaction_type } = data;

    const transaction = await transactionRepository.create(
      userId, category_id, amount, description, date, account_type
    );

    // trigger auto-classification
    if (!category_id) {
      classifyInBackground(transaction.id, description, transaction_type, account_type)
        .catch((err) => {
          logger.error(`[AI] Error fatal saat klasifikasi transaksi ${transaction.id}:`, err.message);
        });
    }

    return transaction;
  },

  // Preview kategori tanpa simpan ke DB
  previewCategory: async (description, transactionType, accountType) => {
    return aiService.predictCategory(description, transactionType, accountType);
  },

  /**
   * Export transaksi ke format CSV
   * @param {string} userId
   * @param {object} filters - { start_date, end_date, category_id }
   * @returns {string} CSV string
   */
  exportCsv: async (userId, filters = {}) => {
    const rows = await transactionRepository.findAllForExport(userId, filters);

    // Header CSV
    const header = 'Tanggal,Deskripsi,Kategori,Jumlah,Status';
    const lines = [header];

    for (const row of rows) {
      // Format tanggal ke YYYY-MM-DD
      const tanggal = row.date instanceof Date
        ? row.date.toISOString().split('T')[0]
        : String(row.date || '').split('T')[0];

      // Escape koma dan kutip dalam deskripsi
      let deskripsi = String(row.description || '');
      if (deskripsi.includes(',') || deskripsi.includes('"') || deskripsi.includes('\n')) {
        deskripsi = `"${deskripsi.replace(/"/g, '""')}"`;
      }

      const kategori = row.category_name || 'Tidak Berkategori';
      const jumlah = row.amount;
      const status = row.classification_status || '';

      lines.push(`${tanggal},${deskripsi},${kategori},${jumlah},${status}`);
    }

    return lines.join('\n');
  },

  // Update transaksi (dengan ownership check)
  update: async (id, userId, fields) => {
    const transaction = await transactionRepository.update(id, userId, fields);
    if (!transaction) {
      const error = new Error('Transaksi tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }
    return transaction;
  },

  // Hapus transaksi (dengan ownership check)
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
