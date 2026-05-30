const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middlewares/auth');

// Semua endpoint analytics memerlukan autentikasi
router.use(auth);

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: API untuk analitik dan statistik keuangan
 */

/**
 * @swagger
 * /analytics/monthly-expenses:
 *   get:
 *     summary: Ambil data pengeluaran bulanan
 *     description: Mengambil total pengeluaran per bulan dengan filter tanggal opsional
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal mulai filter (format YYYY-MM-DD)
 *         example: "2025-01-01"
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal akhir filter (format YYYY-MM-DD)
 *         example: "2025-12-31"
 *     responses:
 *       200:
 *         description: Data pengeluaran bulanan berhasil diambil
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
 *                       month:
 *                         type: string
 *                         format: date-time
 *                         description: Awal bulan (DATE_TRUNC)
 *                       total:
 *                         type: integer
 *                         description: Total pengeluaran bulan tersebut
 *                       budget:
 *                         type: integer
 *                         nullable: true
 *                         description: Budget bulan tersebut (belum tersedia)
 *       401:
 *         description: Unauthorized
 */
router.get('/monthly-expenses', analyticsController.getMonthlyExpenses);

/**
 * @swagger
 * /analytics/income-vs-expense:
 *   get:
 *     summary: Ambil perbandingan pemasukan vs pengeluaran
 *     description: Mengambil data pemasukan dan pengeluaran per periode (weekly/monthly)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal mulai filter (format YYYY-MM-DD)
 *         example: "2025-01-01"
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal akhir filter (format YYYY-MM-DD)
 *         example: "2025-12-31"
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [weekly, monthly]
 *           default: monthly
 *         description: Periode pengelompokan data
 *     responses:
 *       200:
 *         description: Data pemasukan vs pengeluaran berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 period:
 *                   type: string
 *                   example: monthly
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       label:
 *                         type: string
 *                         description: Label periode (nama bulan atau tanggal)
 *                         example: Jan
 *                       income:
 *                         type: integer
 *                         description: Total pemasukan periode tersebut
 *                       expense:
 *                         type: integer
 *                         description: Total pengeluaran periode tersebut
 *       400:
 *         description: Period tidak valid
 *       401:
 *         description: Unauthorized
 */
router.get('/income-vs-expense', analyticsController.getIncomeVsExpense);

/**
 * @swagger
 * /analytics/expense-distribution:
 *   get:
 *     summary: Ambil distribusi pengeluaran per kategori
 *     description: Mengambil distribusi pengeluaran berdasarkan kategori dengan persentase
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal mulai filter (format YYYY-MM-DD)
 *         example: "2025-01-01"
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal akhir filter (format YYYY-MM-DD)
 *         example: "2025-12-31"
 *     responses:
 *       200:
 *         description: Distribusi pengeluaran berhasil diambil
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
 *                       category_name:
 *                         type: string
 *                         description: Nama kategori pengeluaran
 *                         example: Makanan
 *                       total:
 *                         type: integer
 *                         description: Total pengeluaran kategori tersebut
 *                       percentage:
 *                         type: integer
 *                         description: Persentase terhadap total pengeluaran
 *                         example: 35
 *       401:
 *         description: Unauthorized
 */
router.get('/expense-distribution', analyticsController.getExpenseDistribution);

module.exports = router;
