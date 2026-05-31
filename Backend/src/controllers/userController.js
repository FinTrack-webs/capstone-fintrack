const userService = require('../services/userService');
const asyncHandler = require('../utils/asyncHelper');

const userController = {

  getProfile: asyncHandler(async (req, res) => {
    const data = await userService.getProfile(req.user.userId);

    res.status(200).json({
      status: 'success',
      message: 'Profil berhasil diambil',
      data,
    });
  }),

  updateProfile: asyncHandler(async (req, res) => {
    const data = await userService.updateProfile(req.user.userId, req.body);

    res.status(200).json({
      status: 'success',
      message: 'Profil berhasil diperbarui',
      data,
    });
  }),

  changePassword: asyncHandler(async (req, res) => {
    const { current_password, new_password } = req.body;
    await userService.changePassword(req.user.userId, current_password, new_password);

    res.status(200).json({
      status: 'success',
      message: 'Password berhasil diubah',
    });
  }),

  updateAvatar: asyncHandler(async (req, res) => {
    const { avatar_url } = req.body;
    const data = await userService.updateAvatar(req.user.userId, avatar_url);

    res.status(200).json({
      status: 'success',
      message: 'Avatar berhasil diperbarui',
      data,
    });
  }),

  uploadAvatar: asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'File gambar wajib diunggah',
      });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const avatarUrl = `${baseUrl}/uploads/avatars/${req.file.filename}`;
    const data = await userService.updateAvatar(req.user.userId, avatarUrl);

    res.status(200).json({
      status: 'success',
      message: 'Avatar berhasil diunggah dan diperbarui',
      data,
    });
  }),

  toggle2fa: asyncHandler(async (req, res) => {
    const { enabled } = req.body;
    const data = await userService.toggle2fa(req.user.userId, enabled);

    res.status(200).json({
      status: 'success',
      message: `2FA berhasil ${enabled ? 'diaktifkan' : 'dinonaktifkan'}`,
      data,
    });
  }),
};

module.exports = userController;