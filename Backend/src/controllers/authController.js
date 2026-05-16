const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHelper');

const authController = {
  /**
   * POST /api/auth/register
   */
  register: asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await authService.register(email, password);

    res.status(201).json({
      status: 'success',
      message: 'Registrasi berhasil',
      data: user,
    });
  }),

  /**
   * POST /api/auth/login
   */
  login: asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    res.status(200).json({
      status: 'success',
      message: 'Login berhasil',
      data: result,
    });
  }),

  /**
   * POST /api/auth/refresh-token
   */
  refreshToken: asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const result = await authService.refreshToken(refreshToken);

    res.status(200).json({
      status: 'success',
      message: 'Token berhasil diperbarui',
      data: result,
    });
  }),
};

module.exports = authController;
