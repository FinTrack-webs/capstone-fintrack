const express = require('express');
const router = express.Router();

// Import routes
const authRoutes = require('./auth');
const categoryRoutes = require('./categories');
const transactionRoutes = require('./transactions');
const dashboardRoutes = require('./dashboard');

// Mount routes
router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/transactions', transactionRoutes);
router.use('/dashboard', dashboardRoutes);

/**
 * @swagger
 * /:
 *   get:
 *     summary: Info API
 *     tags: [General]
 *     responses:
 *       200:
 *         description: Informasi API
 */
router.get('/', (req, res) => {
  res.json({
    message: 'FinTrack API',
    docs: '/api-docs',
    health: '/api/ping',
    routes: {
      auth: '/api/auth',
      categories: '/api/categories',
      transactions: '/api/transactions',
      dashboard: '/api/dashboard',
    },
  });
});

/**
 * @swagger
 * /ping:
 *   get:
 *     summary: Health check
 *     tags: [General]
 *     responses:
 *       200:
 *         description: API is running
 */
router.get('/ping', (req, res) => {
  res.json({ message: 'Pong!' });
});

module.exports = router;
