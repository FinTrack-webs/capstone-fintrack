const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: API untuk ringkasan data keuangan (Summary)
 */

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Ambil ringkasan dashboard
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ringkasan dashboard berhasil diambil
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