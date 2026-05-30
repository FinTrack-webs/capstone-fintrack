const bcrypt = require('bcryptjs');
const userProfileRepository = require('../repositories/userProfileRepository');

const userService = {
  /**
   * Mengambil profil user berdasarkan ID
   * @param {string} userId
   */
  getProfile: async (userId) => {
    const user = await userProfileRepository.findById(userId);
    if (!user) {
      const error = new Error('User tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }
    return user;
  },

  /**
   * Update profil user (full_name, phone, address)
   * @param {string} userId
   * @param {object} data - { full_name, phone, address }
   */
  updateProfile: async (userId, data) => {
    const user = await userProfileRepository.updateProfile(userId, data);
    if (!user) {
      const error = new Error('User tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }
    return user;
  },

  /**
   * Ubah password user
   * Verifikasi password saat ini sebelum mengubah ke password baru
   * @param {string} userId
   * @param {string} currentPassword - Password saat ini
   * @param {string} newPassword - Password baru
   */
  changePassword: async (userId, currentPassword, newPassword) => {
    // Ambil user dengan password_hash untuk verifikasi
    const user = await userProfileRepository.findByIdWithPassword(userId);
    if (!user) {
      const error = new Error('User tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    // Verifikasi password saat ini
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      const error = new Error('Password saat ini salah');
      error.statusCode = 400;
      throw error;
    }

    // Hash password baru dan update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userProfileRepository.updatePassword(userId, hashedPassword);

    return { message: 'Password berhasil diubah' };
  },

  /**
   * Update avatar URL user
   * @param {string} userId
   * @param {string} avatarUrl
   */
  updateAvatar: async (userId, avatarUrl) => {
    const user = await userProfileRepository.updateAvatar(userId, avatarUrl);
    if (!user) {
      const error = new Error('User tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }
    return user;
  },

  /**
   * Toggle pengaturan 2FA
   * @param {string} userId
   * @param {boolean} enabled
   */
  toggle2fa: async (userId, enabled) => {
    const user = await userProfileRepository.toggle2fa(userId, enabled);
    if (!user) {
      const error = new Error('User tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }
    return user;
  },
};

module.exports = userService;
