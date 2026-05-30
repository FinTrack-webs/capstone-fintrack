const express = require('express');
const router = express.Router();
const savingsGoalController = require('../controllers/savingsGoalController');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validator');
const { createSavingsGoalSchema, updateSavingsGoalSchema } = require('../utils/joiSchemas');

// Semua route savings goals memerlukan auth
router.use(auth);

/**
 * @swagger
 * /savings-goals:
 *   get:
 *     tags: [Savings Goals]
 *     summary: Ambil semua target tabungan milik user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar target tabungan berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Daftar target tabungan berhasil diambil
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SavingsGoal'
 *       401:
 *         description: Token tidak valid atau tidak diberikan
 */
router.get('/', savingsGoalController.getAll);

/**
 * @swagger
 * /savings-goals:
 *   post:
 *     tags: [Savings Goals]
 *     summary: Buat target tabungan baru
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - target_amount
 *             properties:
 *               name:
 *                 type: string
 *                 example: Dana Darurat
 *               target_amount:
 *                 type: integer
 *                 example: 10000000
 *               current_amount:
 *                 type: integer
 *                 example: 0
 *                 default: 0
 *     responses:
 *       201:
 *         description: Target tabungan berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Target tabungan berhasil dibuat
 *                 data:
 *                   $ref: '#/components/schemas/SavingsGoal'
 *       400:
 *         description: Validasi gagal
 *       401:
 *         description: Token tidak valid atau tidak diberikan
 */
router.post('/', validate(createSavingsGoalSchema), savingsGoalController.create);

/**
 * @swagger
 * /savings-goals/{id}:
 *   get:
 *     tags: [Savings Goals]
 *     summary: Ambil detail target tabungan berdasarkan ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID target tabungan
 *     responses:
 *       200:
 *         description: Detail target tabungan berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Detail target tabungan berhasil diambil
 *                 data:
 *                   $ref: '#/components/schemas/SavingsGoal'
 *       401:
 *         description: Token tidak valid atau tidak diberikan
 *       404:
 *         description: Target tabungan tidak ditemukan
 */
router.get('/:id', savingsGoalController.getById);

/**
 * @swagger
 * /savings-goals/{id}:
 *   put:
 *     tags: [Savings Goals]
 *     summary: Update target tabungan
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID target tabungan
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Dana Liburan
 *               target_amount:
 *                 type: integer
 *                 example: 15000000
 *               current_amount:
 *                 type: integer
 *                 example: 5000000
 *     responses:
 *       200:
 *         description: Target tabungan berhasil diperbarui
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Target tabungan berhasil diperbarui
 *                 data:
 *                   $ref: '#/components/schemas/SavingsGoal'
 *       400:
 *         description: Validasi gagal
 *       401:
 *         description: Token tidak valid atau tidak diberikan
 *       404:
 *         description: Target tabungan tidak ditemukan
 */
router.put('/:id', validate(updateSavingsGoalSchema), savingsGoalController.update);

/**
 * @swagger
 * /savings-goals/{id}:
 *   delete:
 *     tags: [Savings Goals]
 *     summary: Hapus target tabungan
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID target tabungan
 *     responses:
 *       200:
 *         description: Target tabungan berhasil dihapus
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Target tabungan berhasil dihapus
 *       401:
 *         description: Token tidak valid atau tidak diberikan
 *       404:
 *         description: Target tabungan tidak ditemukan
 */
router.delete('/:id', savingsGoalController.remove);

/**
 * @swagger
 * components:
 *   schemas:
 *     SavingsGoal:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         user_id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *           example: Dana Darurat
 *         target_amount:
 *           type: integer
 *           example: 10000000
 *         current_amount:
 *           type: integer
 *           example: 2500000
 *         progress_percentage:
 *           type: integer
 *           example: 25
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

module.exports = router;
