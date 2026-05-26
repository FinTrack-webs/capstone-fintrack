const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middlewares/validator');
const auth = require('../middlewares/auth');
const { registerSchema, loginSchema, refreshTokenSchema, logoutSchema } = require('../utils/joiSchemas');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: API untuk Autentikasi User
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrasi user baru
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User berhasil terdaftar
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Bad Request / Email sudah terdaftar
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/register', validate(registerSchema), authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login berhasil
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Email atau password salah
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/login', validate(loginSchema), authController.login);

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenRequest'
 *     responses:
 *       200:
 *         description: Token berhasil diperbarui
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Refresh token tidak valid atau expired
 */
router.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LogoutRequest'
 *     responses:
 *       200:
 *         description: Logout berhasil
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.post('/logout', validate(logoutSchema), authController.logout);

/**
 * @swagger
 * /auth/logout-all:
 *   post:
 *     summary: Logout dari semua perangkat
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout dari semua perangkat berhasil
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized
 */
router.post('/logout-all', auth, authController.logoutAll);

module.exports = router;
