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
      message: 'Kode verifikasi dikirim ke email',
      data: user,
    });
  }),

  /**
   * POST /api/auth/verify-email
   */
  verifyEmail: asyncHandler(async (req, res) => {
    const { email, otp_code } = req.body;
    const result = await authService.verifyEmail(email, otp_code);

    res.status(200).json({
      status: 'success',
      message: 'Email berhasil diverifikasi',
      data: result,
    });
  }),

  /**
   * POST /api/auth/resend-verification-otp
   */
  resendVerificationOtp: asyncHandler(async (req, res) => {
    const { email } = req.body;
    const result = await authService.resendVerificationOtp(email);

    res.status(200).json({
      status: 'success',
      message: 'Kode verifikasi ulang telah dikirim',
      data: result,
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
      message: result.requires_2fa ? 'Kode OTP telah dikirim ke email' : 'Login berhasil',
      data: result,
    });
  }),

  /**
   * POST /api/auth/verify-2fa
   */
  verify2fa: asyncHandler(async (req, res) => {
    const { email, otp_code } = req.body;
    const result = await authService.verify2FA(email, otp_code);

    res.status(200).json({
      status: 'success',
      message: 'Autentikasi verifikasi 2 langkah berhasil',
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

  /**
   * POST /api/auth/logout
   * Revoke satu refresh token
   */
  logout: asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const result = await authService.logout(refreshToken);

    res.status(200).json({
      status: 'success',
      message: result.message,
    });
  }),

  /**
   * POST /api/auth/logout-all
   * Revoke semua refresh token milik user (logout global)
   */
  logoutAll: asyncHandler(async (req, res) => {
    const result = await authService.logoutAll(req.user.userId);

    res.status(200).json({
      status: 'success',
      message: result.message,
    });
  }),
};

module.exports = authController;
