const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const userRepository = require('../repositories/userRepository');
const refreshTokenRepository = require('../repositories/refreshTokenRepository');
const otpRepository = require('../repositories/otpRepository');
const mailer = require('../utils/mailer');
const logger = require('../utils/logger');

const authService = {
  register: async (email, password) => {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      const error = new Error('Email sudah terdaftar');
      error.statusCode = 409;
      throw error;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Simpan user baru
    const user = await userRepository.create(email, passwordHash);
    logger.info(`User baru terdaftar: ${user.email}`);

    return user;
  },


  //Login dan generate tokens
  login: async (email, password) => {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      const error = new Error('Email atau password salah');
      error.statusCode = 401;
      throw error;
    }

    // Verifikasi password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      const error = new Error('Email atau password salah');
      error.statusCode = 401;
      throw error;
    }

    // JIKA 2FA AKTIF -> Generate OTP & Jangan berikan token dahulu
    if (user.two_fa_enabled) {
      // Hapus kode OTP lama
      await otpRepository.deleteByUserId(user.id);

      // Generate 6 digit angka OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Kedaluwarsa dalam 5 menit

      // Simpan OTP ke database
      await otpRepository.create(user.id, otpCode, expiresAt);

      // Kirim email
      await mailer.sendOTP(user.email, otpCode);

      logger.info(`User ${user.email} membutuhkan verifikasi 2FA. OTP dikirimkan.`);

      return {
        two_fa_required: true,
        email: user.email,
      };
    }

    // JIKA 2FA TIDAK AKTIF -> Lanjutkan login reguler
    const payload = { userId: user.id, email: user.email };

    const accessToken = jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.accessTokenExpiry,
    });

    const refreshToken = jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.refreshTokenExpiry,
    });

    // Hitung expiry date untuk disimpan di DB
    const decoded = jwt.decode(refreshToken);
    const expiresAt = new Date(decoded.exp * 1000);

    // Simpan refresh token ke database
    await refreshTokenRepository.create(user.id, refreshToken, expiresAt);

    logger.info(`User login berhasil: ${user.email}`);

    return {
      user: { id: user.id, email: user.email },
      accessToken,
      refreshToken,
    };
  },

  // Verifikasi OTP 2FA dan berikan JWT Token
  verify2FA: async (email, otpCode) => {
    // Cari OTP aktif berdasarkan email & kode
    const activeOtp = await otpRepository.findActiveByEmailAndCode(email, otpCode);
    if (!activeOtp) {
      const error = new Error('Kode OTP salah atau sudah kedaluwarsa');
      error.statusCode = 400;
      throw error;
    }

    // Verifikasi kedaluwarsa di tingkat JavaScript (kebal terhadap ketidakcocokan zona waktu database)
    const now = new Date();
    const expiresAt = new Date(activeOtp.expires_at);
    if (expiresAt < now) {
      const error = new Error('Kode OTP sudah kedaluwarsa');
      error.statusCode = 400;
      throw error;
    }

    // Hapus OTP setelah sukses verifikasi (supaya sekali pakai/one-time)
    await otpRepository.deleteByUserId(activeOtp.user_id);

    // Ambil detail lengkap user
    const user = await userRepository.findByEmail(email);

    // Generate JWT tokens
    const payload = { userId: user.id, email: user.email };

    const accessToken = jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.accessTokenExpiry,
    });

    const refreshToken = jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.refreshTokenExpiry,
    });

    // Hitung expiry date untuk disimpan di DB
    const decoded = jwt.decode(refreshToken);
    const expiresAt = new Date(decoded.exp * 1000);

    // Simpan refresh token ke database
    await refreshTokenRepository.create(user.id, refreshToken, expiresAt);

    logger.info(`Verifikasi 2FA berhasil untuk: ${user.email}`);

    return {
      user: { id: user.id, email: user.email },
      accessToken,
      refreshToken,
    };
  },


  //Refresh token
  refreshToken: async (refreshToken) => {
    try {
      // Verifikasi JWT
      const decoded = jwt.verify(refreshToken, jwtConfig.secret);

      // Cek apakah refresh token ada di database (belum di-revoke)
      const storedToken = await refreshTokenRepository.findByToken(refreshToken);
      if (!storedToken) {
        const error = new Error('Refresh token sudah di-revoke atau tidak valid');
        error.statusCode = 401;
        throw error;
      }

      // Cek apakah user masih ada
      const user = await userRepository.findById(decoded.userId);
      if (!user) {
        const error = new Error('User tidak ditemukan');
        error.statusCode = 401;
        throw error;
      }

      // Generate access token baru
      const payload = { userId: user.id, email: user.email };
      const newAccessToken = jwt.sign(payload, jwtConfig.secret, {
        expiresIn: jwtConfig.accessTokenExpiry,
      });

      return { accessToken: newAccessToken };
    } catch (err) {
      if (err.statusCode) throw err;
      const error = new Error('Refresh token tidak valid atau sudah expired');
      error.statusCode = 401;
      throw error;
    }
  },

  //Logout
  logout: async (refreshToken) => {
    const deleted = await refreshTokenRepository.deleteByToken(refreshToken);
    if (!deleted) {
      const error = new Error('Refresh token tidak ditemukan');
      error.statusCode = 400;
      throw error;
    }
    logger.info('User berhasil logout (refresh token di-revoke)');
    return { message: 'Logout berhasil' };
  },

  //Logout semua
  logoutAll: async (userId) => {
    const count = await refreshTokenRepository.deleteAllByUserId(userId);
    logger.info(`User ${userId} logout global: ${count} token di-revoke`);
    return { message: `Logout berhasil dari ${count} sesi` };
  },
};

module.exports = authService;
