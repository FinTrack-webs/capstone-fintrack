const logger = require('../utils/logger');
const categoryRepository = require('../repositories/categoryRepository');

/**
 * AI Mock Service
 * Simulasi klasifikasi transaksi berdasarkan keyword di deskripsi
 * Pattern: Fire-and-Forget Async (delay 2 detik)
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
];

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

    // Cari match keyword
    for (const mapping of KEYWORD_MAP) {
      for (const keyword of mapping.keywords) {
        if (lowerDesc.includes(keyword)) {
          // Cari kategori di database berdasarkan nama
          const categories = await categoryRepository.findAll();
          const matchedCategory = categories.find(
            (c) => c.name.toLowerCase() === mapping.categoryName.toLowerCase()
          );

          if (matchedCategory) {
            const result = {
              transactionId,
              categoryId: matchedCategory.id,
              confidence: 0.85 + Math.random() * 0.14, // 0.85 - 0.99
            };
            logger.info(`[AI Mock] Klasifikasi berhasil:`, result);
            return result;
          }
        }
      }
    }

    // Jika tidak ada match, kembalikan null (gagal klasifikasi)
    logger.warn(`[AI Mock] Tidak dapat mengklasifikasi: "${description}"`);
    return {
      transactionId,
      categoryId: null,
      confidence: 0,
    };
  },
};

module.exports = aiMockService;
