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

    // Simpan user baru (email_verified default false dari DB)
    const user = await userRepository.create(email, passwordHash);
    
    // Generate OTP untuk verifikasi email
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 menit
    await otpRepository.create(user.id, otpCode, expiresAt);
    
    // Kirim email (fire and forget agar tidak blocking)
    mailer.sendOTP(user.email, otpCode).catch(err => {
      logger.error(`Gagal mengirim email OTP registrasi ke ${user.email}: ${err.message}`);
    });

    logger.info(`User baru terdaftar: ${user.email}. OTP dikirim.`);

    return {
      email: user.email,
      requires_email_verification: true
    };
  },

  // Verifikasi Email
  verifyEmail: async (email, otpCode) => {
    const activeOtp = await otpRepository.findActiveByEmailAndCode(email, otpCode);
    if (!activeOtp) {
      const error = new Error('Kode OTP salah atau sudah kedaluwarsa');
      error.statusCode = 400;
      throw error;
    }

    const now = new Date();
    const otpExpiresAt = new Date(activeOtp.expires_at);
    if (otpExpiresAt < now) {
      const error = new Error('Kode OTP sudah kedaluwarsa');
      error.statusCode = 400;
      throw error;
    }

    // Set email_verified = true
    await userRepository.verifyEmail(activeOtp.user_id);
    await otpRepository.deleteByUserId(activeOtp.user_id);
    
    logger.info(`Email terverifikasi untuk: ${email}`);
    
    return {
      email,
      email_verified: true
    };
  },

  // Resend OTP Verifikasi Email
  resendVerificationOtp: async (email) => {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      const error = new Error('User tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    if (user.email_verified) {
      const error = new Error('Email sudah terverifikasi');
      error.statusCode = 400;
      throw error;
    }

    // Hapus OTP lama dan buat baru
    await otpRepository.deleteByUserId(user.id);
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await otpRepository.create(user.id, otpCode, expiresAt);

    mailer.sendOTP(user.email, otpCode).catch(err => {
      logger.error(`Gagal mengirim ulang email OTP registrasi ke ${user.email}: ${err.message}`);
    });

    return {
      email: user.email,
      message: 'Kode OTP baru telah dikirim'
    };
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

    // Cek apakah email sudah diverifikasi
    if (user.email_verified === false) {
      const error = new Error('Email belum diverifikasi. Silakan periksa email Anda untuk kode OTP atau minta ulang.');
      error.statusCode = 403;
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

      // Kirim email (fire-and-forget, jangan di-await agar response cepat)
      mailer.sendOTP(user.email, otpCode).catch(err => {
        logger.error(`Gagal mengirim email OTP 2FA ke ${user.email}: ${err.message}`);
      });

      logger.info(`User ${user.email} membutuhkan verifikasi 2FA. OTP dikirimkan.`);

      return {
        requires_2fa: true,
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
    logger.info(`[2FA] Mencoba verifikasi OTP - email: "${email}", kode: "${otpCode}"`);

    // Debug: Cek semua OTP yang ada untuk email ini
    const { query } = require('../config/db');
    const debugResult = await query(
      `SELECT o.code, o.expires_at, o.created_at, u.email 
       FROM otp_codes o 
       JOIN users u ON o.user_id = u.id 
       WHERE u.email = $1`,
      [email]
    );
    logger.info(`[2FA] OTP records ditemukan di DB untuk email "${email}": ${JSON.stringify(debugResult.rows)}`);

    // Cari OTP aktif berdasarkan email & kode
    const activeOtp = await otpRepository.findActiveByEmailAndCode(email, otpCode);
    if (!activeOtp) {
      logger.error(`[2FA] Tidak ditemukan OTP yang cocok! Input email="${email}", kode="${otpCode}"`);
      const error = new Error('Kode OTP salah atau sudah kedaluwarsa');
      error.statusCode = 400;
      throw error;
    }

    // Verifikasi kedaluwarsa di tingkat JavaScript (kebal terhadap ketidakcocokan zona waktu database)
    const now = new Date();
    const otpExpiresAt = new Date(activeOtp.expires_at);
    if (otpExpiresAt < now) {
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
