const categoryRepository = require('../repositories/categoryRepository');

const categoryService = {

  //Ambil semua kategori
  getAll: async () => {
    return categoryRepository.findAll();
  },

  //Ambil kategori berdasarkan ID
  getById: async (id) => {
    const category = await categoryRepository.findById(id);
    if (!category) {
      const error = new Error('Kategori tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }
    return category;
  },

  //Buat kategori baru
  create: async (name, type, iconUrl) => {
    return categoryRepository.create(name, type, iconUrl);
  },

  //Update kategori
  update: async (id, fields) => {
    const category = await categoryRepository.update(id, fields);
    if (!category) {
      const error = new Error('Kategori tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }
    return category;
  },

  //Hapus kategori
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
