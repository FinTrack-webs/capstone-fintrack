const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const userRepository = require('../repositories/userRepository');
const refreshTokenRepository = require('../repositories/refreshTokenRepository');
const logger = require('../utils/logger');

const authService = {

  //Register user baru
  register: async (email, password) => {
    // Cek apakah email sudah terdaftar
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
    // Cari user
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

    // Generate tokens
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


  //Refresh token
  refreshToken: async (refreshToken) => {
    try {
      // Verifikasi JWT validity
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
