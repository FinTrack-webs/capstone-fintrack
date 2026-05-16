const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const validate = require('../middlewares/validator');
const auth = require('../middlewares/auth');
const { createTransactionSchema, updateTransactionSchema } = require('../utils/joiSchemas');

// Semua route transaksi memerlukan auth
router.use(auth);

// GET /api/transactions
router.get('/', transactionController.getAll);

// GET /api/transactions/:id
router.get('/:id', transactionController.getById);

// POST /api/transactions
router.post('/', validate(createTransactionSchema), transactionController.create);

// PUT /api/transactions/:id
router.put('/:id', validate(updateTransactionSchema), transactionController.update);

// DELETE /api/transactions/:id
router.delete('/:id', transactionController.delete);

module.exports = router;
