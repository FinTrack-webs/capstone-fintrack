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

// Health check
router.get('/ping', (req, res) => {
  res.json({ message: 'Pong!' });
});

module.exports = router;
