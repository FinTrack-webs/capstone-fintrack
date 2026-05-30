const express = require('express');
const router = express.Router();
const aiInsightController = require('../controllers/aiInsightController');
const auth = require('../middlewares/auth');

// Semua endpoint AI insights memerlukan autentikasi
router.use(auth);

/**
 * @swagger
 * tags:
 *   name: AI Insights
 *   description: API untuk insight keuangan dan skor kesehatan keuangan berbasis AI
 */

/**
 * @swagger
 * /ai/insights:
 *   get:
 *     summary: Ambil insight keuangan
 *     description: Menghasilkan insight kondisional berdasarkan data keuangan user bulan berjalan
 *     tags: [AI Insights]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Insight keuangan berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         enum: [warning, tip, info]
 *                         description: Tipe insight
 *                         example: warning
 *                       message:
 *                         type: string
 *                         description: Pesan insight
 *                         example: Pengeluaran bulan ini melebihi pemasukan.
 *                       action_label:
 *                         type: string
 *                         nullable: true
 *                         description: Label tombol aksi (opsional)
 *                         example: Lihat Rincian
 *       401:
 *         description: Unauthorized
 */
router.get('/insights', aiInsightController.getInsights);

/**
 * @swagger
 * /ai/financial-health-score:
 *   get:
 *     summary: Ambil skor kesehatan keuangan
 *     description: Menghitung skor kesehatan keuangan (0-100) berdasarkan data bulan berjalan
 *     tags: [AI Insights]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Skor kesehatan keuangan berhasil dihitung
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     score:
 *                       type: integer
 *                       minimum: 0
 *                       maximum: 100
 *                       description: Skor kesehatan keuangan
 *                       example: 75
 *                     total_income:
 *                       type: integer
 *                       description: Total pemasukan bulan berjalan
 *                       example: 5000000
 *                     total_expense:
 *                       type: integer
 *                       description: Total pengeluaran bulan berjalan
 *                       example: 3500000
 *       401:
 *         description: Unauthorized
 */
router.get('/financial-health-score', aiInsightController.getFinancialHealthScore);

module.exports = router;
