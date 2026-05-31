const categoryRepository = require('../repositories/categoryRepository');

const categoryService = {

  getAll: async () => {
    return categoryRepository.findAll();
  },

  getById: async (id) => {
    const category = await categoryRepository.findById(id);
    if (!category) {
      const error = new Error('Kategori tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }
    return category;
  },

  create: async (name, type, iconUrl) => {
    return categoryRepository.create(name, type, iconUrl);
  },

  update: async (id, fields) => {
    const category = await categoryRepository.update(id, fields);
    if (!category) {
      const error = new Error('Kategori tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }
    return category;
  },

  delete: async (id) => {
    const category = await categoryRepository.delete(id);
    if (!category) {
      const error = new Error('Kategori tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }
    return category;
  },
};

module.exports = categoryService;