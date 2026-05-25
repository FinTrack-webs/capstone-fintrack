const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const validate = require('../middlewares/validator');
const auth = require('../middlewares/auth');
const { createCategorySchema, updateCategorySchema } = require('../utils/joiSchemas');

router.get('/', categoryController.getAll);
router.get('/:id', categoryController.getById);
router.post('/', auth, validate(createCategorySchema), categoryController.create);
router.post('/', auth, validate(createCategorySchema), categoryController.create);
router.put('/:id', auth, validate(updateCategorySchema), categoryController.update);
router.delete('/:id', auth, categoryController.delete);

module.exports = router;
