const savingsGoalRepository = require('../repositories/savingsGoalRepository');

/**
 * Helper: menambahkan progress_percentage ke objek goal
 * @param {object} goal
 */
const addProgress = (goal) => ({
  ...goal,
  progress_percentage: Math.round((goal.current_amount / goal.target_amount) * 100),
});

const savingsGoalService = {
  /**
   * Mengambil semua target tabungan milik user
   * Menambahkan progress_percentage ke setiap goal
   * @param {string} userId
   */
  getAll: async (userId) => {
    const goals = await savingsGoalRepository.findAllByUserId(userId);
    return goals.map(addProgress);
  },

  /**
   * Mengambil satu target tabungan berdasarkan ID
   * @param {string} userId
   * @param {string} goalId
   */
  getById: async (userId, goalId) => {
    const goal = await savingsGoalRepository.findByIdAndUserId(goalId, userId);
    if (!goal) {
      const error = new Error('Target tabungan tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }
    return addProgress(goal);
  },

  /**
   * Membuat target tabungan baru
   * @param {string} userId
   * @param {object} data - { name, target_amount, current_amount }
   */
  create: async (userId, data) => {
    const goal = await savingsGoalRepository.create(userId, data);
    return addProgress(goal);
  },

  /**
   * Update target tabungan (dengan ownership check)
   * @param {string} userId
   * @param {string} goalId
   * @param {object} data - { name, target_amount, current_amount }
   */
  update: async (userId, goalId, data) => {
    // Cek kepemilikan
    const existing = await savingsGoalRepository.findByIdAndUserId(goalId, userId);
    if (!existing) {
      const error = new Error('Target tabungan tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    const goal = await savingsGoalRepository.update(goalId, data);
    return addProgress(goal);
  },

  /**
   * Hapus target tabungan (dengan ownership check)
   * @param {string} userId
   * @param {string} goalId
   */
  remove: async (userId, goalId) => {
    // Cek kepemilikan
    const existing = await savingsGoalRepository.findByIdAndUserId(goalId, userId);
    if (!existing) {
      const error = new Error('Target tabungan tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    return savingsGoalRepository.remove(goalId);
  },
};

module.exports = savingsGoalService;
