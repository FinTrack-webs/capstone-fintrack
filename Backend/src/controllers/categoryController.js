const categoryService = require('../services/categoryService');
const asyncHandler = require('../utils/asyncHelper');

const categoryController = {

  getAll: asyncHandler(async (req, res) => {
    const categories = await categoryService.getAll();

    res.status(200).json({
      status: 'success',
      data: categories,
    });
  }),

  getById: asyncHandler(async (req, res) => {
    const category = await categoryService.getById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: category,
    });
  }),

  create: asyncHandler(async (req, res) => {
    const { name, type, icon_url } = req.body;
    const category = await categoryService.create(name, type, icon_url);

    res.status(201).json({
      status: 'success',
      message: 'Kategori berhasil dibuat',
      data: category,
    });
  }),

  update: asyncHandler(async (req, res) => {
    const category = await categoryService.update(req.params.id, req.body);

    res.status(200).json({
      status: 'success',
      message: 'Kategori berhasil diperbarui',
      data: category,
    });
  }),

  delete: asyncHandler(async (req, res) => {
    await categoryService.delete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Kategori berhasil dihapus',
    });
  }),
};

module.exports = categoryController;