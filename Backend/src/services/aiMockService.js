const logger = require('../utils/logger');
const categoryRepository = require('../repositories/categoryRepository');

/**
 * AI Mock Service
 * Simulasi klasifikasi transaksi berdasarkan keyword di deskripsi
 * Pattern: Fire-and-Forget Async (delay 2 detik)
 *
 * Perbaikan:
 * - Fuzzy matching (includes) saat mencocokkan nama kategori dari DB
 * - Fallback ke kategori "Lainnya" jika tidak ada keyword match
 * - Simple in-memory cache untuk daftar kategori (refresh setiap 5 menit)
 */

// Keyword mapping ke kategori (mock)
const KEYWORD_MAP = [
  { keywords: ['makan', 'resto', 'restaurant', 'warung', 'cafe', 'kopi', 'nasi', 'ayam'], categoryName: 'Makanan' },
  { keywords: ['bensin', 'parkir', 'tol', 'grab', 'gojek', 'ojol', 'transport', 'bus', 'kereta'], categoryName: 'Transportasi' },
  { keywords: ['listrik', 'air', 'internet', 'wifi', 'pulsa', 'token', 'pln'], categoryName: 'Utilitas' },
  { keywords: ['belanja', 'baju', 'sepatu', 'online', 'shopee', 'tokopedia'], categoryName: 'Belanja' },
  { keywords: ['gaji', 'salary', 'bonus', 'honor', 'upah', 'pendapatan'], categoryName: 'Gaji' },
  { keywords: ['hiburan', 'film', 'bioskop', 'game', 'netflix', 'spotify'], categoryName: 'Hiburan' },
  { keywords: ['obat', 'dokter', 'rumah sakit', 'rs', 'apotek', 'kesehatan'], categoryName: 'Kesehatan' },
  { keywords: ['sewa', 'kontrakan', 'kos', 'kost', 'rumah'], categoryName: 'Tempat Tinggal' },
  { keywords: ['buku', 'kuliah', 'sekolah', 'kursus', 'les', 'pendidikan'], categoryName: 'Pendidikan' },
  { keywords: ['freelance', 'project', 'klien', 'client'], categoryName: 'Freelance' },
  { keywords: ['investasi', 'saham', 'reksadana', 'crypto', 'deposit'], categoryName: 'Investasi' },
];

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

  logger.debug('[AI Mock] Refreshing category cache dari database...');
  categoryCache = await categoryRepository.findAll();
  cacheTimestamp = now;
  return categoryCache;
};

/**
 * Fuzzy match: cari kategori dari DB yang namanya mengandung target name
 * Prioritas: exact match > includes match
 */
const findCategoryByName = (categories, targetName) => {
  const lowerTarget = targetName.toLowerCase();

  // Prioritas 1: Kecocokan (case-insensitive)
  const exactMatch = categories.find(
    (c) => c.name.toLowerCase() === lowerTarget
  );
  if (exactMatch) return exactMatch;

  // Prioritas 2: Mencakup kecocokan (kategori DB mengandung target, atau sebaliknya)
  const includesMatch = categories.find(
    (c) => c.name.toLowerCase().includes(lowerTarget) || lowerTarget.includes(c.name.toLowerCase())
  );
  return includesMatch || null;
};

const aiMockService = {
  /**
   * Classify transaksi berdasarkan deskripsi (mock)
   * Input:  { transactionId: "uuid", description: "string" }
   * Output: { transactionId: "uuid", categoryId: number, confidence: 0.XX }
   */
  classify: async (transactionId, description) => {
    logger.info(`[AI Mock] Mulai klasifikasi transaksi: ${transactionId}`);

    // Simulasi delay 2 detik (seolah memanggil AI API)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const lowerDesc = description.toLowerCase();
    const categories = await getCategoriesWithCache();

    // Cari match keyword
    for (const mapping of KEYWORD_MAP) {
      for (const keyword of mapping.keywords) {
        if (lowerDesc.includes(keyword)) {
          const matchedCategory = findCategoryByName(categories, mapping.categoryName);

          if (matchedCategory) {
            const result = {
              transactionId,
              categoryId: matchedCategory.id,
              confidence: 0.85 + Math.random() * 0.14,
            };
            logger.info(`[AI Mock] Klasifikasi berhasil:`, result);
            return result;
          }
        }
      }
    }

    // Fallback: assign ke kategori "Lainnya" jika tersedia
    const fallbackCategory = findCategoryByName(categories, FALLBACK_CATEGORY_NAME);

    if (fallbackCategory) {
      const result = {
        transactionId,
        categoryId: fallbackCategory.id,
        confidence: 0.50,
      };
      logger.warn(`[AI Mock] Tidak ada keyword match, fallback ke "${FALLBACK_CATEGORY_NAME}":`, result);
      return result;
    }

    // Jika bahkan "Lainnya" tidak ada di DB
    logger.warn(`[AI Mock] Tidak dapat mengklasifikasi dan fallback tidak tersedia: "${description}"`);
    return {
      transactionId,
      categoryId: null,
      confidence: 0,
    };
  },

  /**
   * Invalidate cache secara manual (berguna saat kategori baru ditambah)
   */
  invalidateCache: () => {
    categoryCache = null;
    cacheTimestamp = 0;
    logger.info('[AI Mock] Category cache di-invalidate');
  },
};

module.exports = aiMockService;
