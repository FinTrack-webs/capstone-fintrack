const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middlewares/auth');

/**
 * @swagger
 * /dashboard:
 *   get:
 *     tags: [Dashboard]
 *     summary: Ambil ringkasan keuangan user
 *     description: Menampilkan total income, total expense, balance, dan breakdown per kategori.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ringkasan dashboard
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/DashboardSummary'
 *       401:
 *         description: Unauthorized
 */
router.get('/', auth, dashboardController.getSummary);

module.exports = router;
