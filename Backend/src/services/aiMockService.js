const logger = require('../utils/logger');
const categoryRepository = require('../repositories/categoryRepository');

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

let categoryCache = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

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

const findCategoryByName = (categories, targetName) => {
  const lowerTarget = targetName.toLowerCase();

  const exactMatch = categories.find(
    (c) => c.name.toLowerCase() === lowerTarget
  );
  if (exactMatch) return exactMatch;

  const includesMatch = categories.find(
    (c) => c.name.toLowerCase().includes(lowerTarget) || lowerTarget.includes(c.name.toLowerCase())
  );
  return includesMatch || null;
};

const aiMockService = {
  predictCategory: async () => ({
    predicted_category: 'Transportasi',
    confidence_score: 0.95,
    mapped_name: 'Transportasi',
  }),
  
  isAlive: async () => true,

  classify: async (transactionId, description) => {
    logger.info(`[AI Mock] Mulai klasifikasi transaksi: ${transactionId}`);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const lowerDesc = description.toLowerCase();
    const categories = await getCategoriesWithCache();

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

    logger.warn(`[AI Mock] Tidak dapat mengklasifikasi dan fallback tidak tersedia: "${description}"`);
    return {
      transactionId,
      categoryId: null,
      confidence: 0,
    };
  },
  
  invalidateCache: () => {
    categoryCache = null;
    cacheTimestamp = 0;
    logger.info('[AI Mock] Category cache di-invalidate');
  },
};

module.exports = aiMockService;