const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const validate = require('../middlewares/validator');
const auth = require('../middlewares/auth');
const { createTransactionSchema, updateTransactionSchema, predictCategorySchema } = require('../utils/joiSchemas');

// Semua route transaksi memerlukan auth
router.use(auth);

/**
 * @swagger
 * /transactions:
 *   get:
 *     tags: [Transactions]
 *     summary: Ambil semua transaksi milik user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar transaksi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transaction'
 */
router.get('/', transactionController.getAll);

/**
 * @swagger
 * /transactions/predict-only:
 *   post:
 *     tags: [Transactions]
 *     summary: Preview kategori AI tanpa simpan ke database
 *     description: Panggil FinTrack AI untuk prediksi kategori transaksi. Hasilnya tidak disimpan ke database.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - description
 *               - transaction_type
 *             properties:
 *               description:
 *                 type: string
 *                 example: "Grab ke kantor"
 *               transaction_type:
 *                 type: string
 *                 example: "debit"
 *               account_type:
 *                 type: string
 *                 enum: [personal, business]
 *                 default: personal
 *     responses:
 *       200:
 *         description: Prediksi kategori berhasil
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
 *                     predicted_category:
 *                       type: string
 *                       example: Transportasi
 *                     confidence_score:
 *                       type: number
 *                       example: 0.9731
 *                     mapped_category:
 *                       type: string
 *                       example: Transportasi
 *       503:
 *         description: AI service tidak tersedia
 */
router.post('/predict-only', validate(predictCategorySchema), transactionController.previewCategory);

/**
 * @swagger
 * /transactions/{id}:
 *   get:
 *     tags: [Transactions]
 *     summary: Ambil transaksi berdasarkan ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Detail transaksi
 *       404:
 *         description: Transaksi tidak ditemukan
 */
router.get('/:id', transactionController.getById);

/**
 * @swagger
 * /transactions:
 *   post:
 *     tags: [Transactions]
 *     summary: Buat transaksi baru
 *     description: Jika category_id tidak diisi, AI Mock akan auto-classify secara async (fire-and-forget).
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTransactionRequest'
 *     responses:
 *       201:
 *         description: Transaksi berhasil dibuat
 *       400:
 *         description: Validasi gagal
 */
router.post('/', validate(createTransactionSchema), transactionController.create);

/**
 * @swagger
 * /transactions/{id}:
 *   put:
 *     tags: [Transactions]
 *     summary: Update transaksi
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTransactionRequest'
 *     responses:
 *       200:
 *         description: Transaksi berhasil diperbarui
 *       404:
 *         description: Transaksi tidak ditemukan
 */
router.put('/:id', validate(updateTransactionSchema), transactionController.update);

/**
 * @swagger
 * /transactions/{id}:
 *   delete:
 *     tags: [Transactions]
 *     summary: Hapus transaksi
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Transaksi berhasil dihapus
 *       404:
 *         description: Transaksi tidak ditemukan
 */
router.delete('/:id', transactionController.delete);

module.exports = router;
