const db = require('../config/db');

const categoryRepository = {
  /**
   * Mengambil semua kategori
   */
  findAll: async () => {
    const result = await db.query('SELECT * FROM categories ORDER BY id ASC');
    return result.rows;
  },

  /**
   * Mencari kategori berdasarkan ID
   */
  findById: async (id) => {
    const result = await db.query('SELECT * FROM categories WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  /**
   * Membuat kategori baru
   */
  create: async (name, type, iconUrl) => {
    const result = await db.query(
      'INSERT INTO categories (name, type, icon_url) VALUES ($1, $2, $3) RETURNING *',
      [name, type, iconUrl || null]
    );
    return result.rows[0];
  },

  /**
   * Update kategori
   */
  update: async (id, fields) => {
    const setClauses = [];
    const values = [];
    let paramCount = 1;

    if (fields.name !== undefined) {
      setClauses.push(`name = $${paramCount++}`);
      values.push(fields.name);
    }
    if (fields.type !== undefined) {
      setClauses.push(`type = $${paramCount++}`);
      values.push(fields.type);
    }
    if (fields.icon_url !== undefined) {
      setClauses.push(`icon_url = $${paramCount++}`);
      values.push(fields.icon_url);
    }

    values.push(id);
    const query = `UPDATE categories SET ${setClauses.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await db.query(query, values);
    return result.rows[0] || null;
  },

  /**
   * Hapus kategori
   */
  delete: async (id) => {
    const result = await db.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  },
};

module.exports = categoryRepository;
