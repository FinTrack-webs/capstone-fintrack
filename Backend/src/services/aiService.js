const logger = require('../utils/logger');

/**
 * AI Service
 * Menghubungkan backend dengan FinTrack AI API untuk klasifikasi transaksi.
 * Mendukung dual endpoint: /predict/personal dan /predict/business
 */

// BASE URL dari environment variable
const FINTRACK_URL = process.env.FINTRACK_API_URL;

// Normalisasi tipe transaksi ke format FinTrack
const normalizeType = (type) => {
  const map = {
    debit: 'debit', credit: 'kredit', kredit: 'kredit',
    transfer: 'transfer', income: 'kredit', expense: 'debit',
  };
  return map[type?.toLowerCase()] ?? 'debit';
};

// Mapping nama kategori FinTrack → nama kategori di tabel categories
// Digunakan untuk mencari category_id yang sesuai
const CATEGORY_MAP = {
  // Personal
  'Gaji': 'Gaji',
  'Hiburan': 'Hiburan',
  'Makanan & Minuman': 'Makanan',
  'Belanja Bulanan': 'Belanja',
  'Tempat Tinggal': 'Tempat Tinggal',
  'Transportasi': 'Transportasi',
  'Pembayaran Langganan': 'Utilitas',
  'Pulsa & Internet': 'Utilitas',
  'Transfer Teman/Keluarga': 'Lainnya',
  // Business
  'Gaji & Karyawan': 'Gaji',
  'Pembelian Stok': 'Belanja',
  'Transportasi & Logistik': 'Transportasi',
  'Software & Langganan': 'Utilitas',
  'Operasional Kantor': 'Utilitas',
  'Marketing & Promosi': 'Lainnya',
  'Modal & Investasi': 'Investasi',
  'Pajak & Perizinan': 'Lainnya',
  'Peralatan & Aset': 'Lainnya',
  'Piutang': 'Lainnya',
  'Utang & Cicilan': 'Lainnya',
  'Biaya Bank': 'Lainnya',
  'Penjualan': 'Freelance',
  'Lain-lain': 'Lainnya',
};

/**
 * Prediksi kategori dari FinTrack AI
 * Return: { predicted_category, confidence_score, mapped_name } atau null jika gagal
 */
const predictCategory = async (description, transactionType, accountType = 'personal') => {
  if (!FINTRACK_URL) {
    logger.warn('[aiService] FINTRACK_API_URL tidak diset');
    return null;
  }
  const endpoint = accountType === 'business' ? '/predict/business' : '/predict/personal';
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`${FINTRACK_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description,
        transaction_type: normalizeType(transactionType),
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`FinTrack responded ${res.status}`);
    const data = await res.json();
    return {
      predicted_category: data.predicted_category,
      confidence_score: data.confidence_score,
      mapped_name: CATEGORY_MAP[data.predicted_category] ?? 'Lainnya',
    };
  } catch (err) {
    logger.error(`[aiService.predictCategory] ${err.message}`);
    return null; // JANGAN throw — transaksi harus tetap bisa disimpan
  }
};

/**
 * Health check FinTrack AI API
 */
const isAlive = async () => {
  if (!FINTRACK_URL) return false;
  try {
    const res = await fetch(`${FINTRACK_URL}/`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch { return false; }
};

/**
 * Invalidate cache (retained for backward compatibility)
 */
const invalidateCache = () => {
  logger.info('[aiService] Cache invalidate dipanggil (noop — cache sudah dihapus)');
};

module.exports = { predictCategory, isAlive, invalidateCache };
