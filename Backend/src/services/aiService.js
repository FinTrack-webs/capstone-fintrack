const logger = require('../utils/logger');
const categoryRepository = require('../repositories/categoryRepository');

/**
 * AI Service
 * Menghubungkan backend dengan model AI lokal untuk klasifikasi transaksi.
 */

const AI_MODEL_URL = process.env.AI_MODEL_URL || 'http://localhost:8000/predict';
const FALLBACK_CATEGORY_NAME = 'Lainnya';

// Simple in-memory cache
let categoryCache = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Ambil daftar kategori dari DB dengan caching sederhana
 */
const getCategoriesWithCache = async () => {
  const now = Date.now();

  if (categoryCache && (now - cacheTimestamp) < CACHE_TTL_MS) {
    return categoryCache;
  }

  logger.debug('[AI] Refreshing category cache dari database...');
  categoryCache = await categoryRepository.findAll();
  cacheTimestamp = now;
  return categoryCache;
};

/**
 * Fuzzy match: cari kategori dari DB yang namanya mengandung target name
 */
const findCategoryByName = (categories, targetName) => {
  if (!targetName) return null;
  const lowerTarget = targetName.toLowerCase();

  // Prioritas 1: Exact match
  const exactMatch = categories.find(
    (c) => c.name.toLowerCase() === lowerTarget
  );
  if (exactMatch) return exactMatch;

  // Prioritas 2: Includes match
  const includesMatch = categories.find(
    (c) => c.name.toLowerCase().includes(lowerTarget) || lowerTarget.includes(c.name.toLowerCase())
  );
  return includesMatch || null;
};

const aiService = {
  /**
   * Classify transaksi dengan memanggil AI Model API
   */
  classify: async (transactionId, description) => {
    logger.info(`[AI] Memulai klasifikasi untuk transaksi: ${transactionId}`);

    try {
      // 1. Panggil API AI Model
      // Catatan: Sesuaikan JSON body dan field response dengan model AI Anda
      const response = await fetch(AI_MODEL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
      });

      if (!response.ok) {
        throw new Error(`AI Model API error: ${response.statusText}`);
      }

      const aiResult = await response.json();
      logger.info(`[AI] Response dari model:`, aiResult);

      // Anggap AI mengembalikan { "category": "Makanan", "confidence": 0.95 }
      // Sesuaikan 'aiResult.category' dengan field yang benar dari API Anda
      const categoryNameFromAI = aiResult.category || aiResult.label || null;
      const confidence = aiResult.confidence || aiResult.score || 0;

      // 2. Map nama kategori ke ID di database
      const categories = await getCategoriesWithCache();
      let matchedCategory = findCategoryByName(categories, categoryNameFromAI);

      if (matchedCategory) {
        return {
          transactionId,
          categoryId: matchedCategory.id,
          confidence,
        };
      }

      // 3. Fallback jika tidak ada match
      logger.warn(`[AI] Kategori "${categoryNameFromAI}" tidak ditemukan di DB, menggunakan fallback.`);
      const fallbackCategory = findCategoryByName(categories, FALLBACK_CATEGORY_NAME);

      return {
        transactionId,
        categoryId: fallbackCategory ? fallbackCategory.id : null,
        confidence: 0.50,
      };

    } catch (error) {
      logger.error(`[AI] Gagal memanggil AI Model: ${error.message}`);
      throw error; // Biarkan transactionService yang menangani error-nya
    }
  },

  invalidateCache: () => {
    categoryCache = null;
    cacheTimestamp = 0;
    logger.info('[AI] Category cache di-invalidate');
  },
};

module.exports = aiService;
