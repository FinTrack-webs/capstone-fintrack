const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const validate = require('../middlewares/validator');
const auth = require('../middlewares/auth');
const { createCategorySchema, updateCategorySchema } = require('../utils/joiSchemas');

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: API untuk manajemen kategori transaksi
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Ambil semua kategori
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Daftar kategori berhasil diambil
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
 *                     $ref: '#/components/schemas/Category'
 */
router.get('/', categoryController.getAll);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Ambil kategori berdasarkan ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detail kategori
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       404:
 *         description: Kategori tidak ditemukan
 */
router.get('/:id', categoryController.getById);

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Buat kategori baru (Admin/Internal)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCategoryRequest'
 *     responses:
 *       201:
 *         description: Kategori berhasil dibuat
 *       401:
 *         description: Unauthorized
 */
router.post('/', auth, validate(createCategorySchema), categoryController.create);

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Update kategori
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCategoryRequest'
 *     responses:
 *       200:
 *         description: Kategori berhasil diperbarui
 *       404:
 *         description: Kategori tidak ditemukan
 */
router.put('/:id', auth, validate(updateCategorySchema), categoryController.update);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Hapus kategori
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Kategori berhasil dihapus
 *       404:
 *         description: Kategori tidak ditemukan
 */
router.delete('/:id', auth, categoryController.delete);

module.exports = router;
