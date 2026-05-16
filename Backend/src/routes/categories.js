const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const validate = require('../middlewares/validator');
const auth = require('../middlewares/auth');
const { createCategorySchema, updateCategorySchema } = require('../utils/joiSchemas');

// GET /api/categories — Publik (untuk dropdown dll)
router.get('/', categoryController.getAll);

// GET /api/categories/:id
router.get('/:id', categoryController.getById);

// POST /api/categories — Protected
router.post('/', auth, validate(createCategorySchema), categoryController.create);

// PUT /api/categories/:id — Protected
router.put('/:id', auth, validate(updateCategorySchema), categoryController.update);

// DELETE /api/categories/:id — Protected
router.delete('/:id', auth, categoryController.delete);

module.exports = router;
