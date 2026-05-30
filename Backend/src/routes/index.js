const express = require('express');
const router = express.Router();

// Import routes
const authRoutes = require('./auth');
const categoryRoutes = require('./categories');
const transactionRoutes = require('./transactions');
const dashboardRoutes = require('./dashboard');
const usersRoutes = require('./users');
const analyticsRoutes = require('./analytics');
const savingsGoalsRoutes = require('./savingsGoals');
const aiRoutes = require('./ai');

// Mount routes
router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/transactions', transactionRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/users', usersRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/savings-goals', savingsGoalsRoutes);
router.use('/ai', aiRoutes);

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
      users: '/api/users',
      analytics: '/api/analytics',
      'savings-goals': '/api/savings-goals',
      ai: '/api/ai',
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
