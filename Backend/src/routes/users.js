const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validator');
const { updateProfileSchema, changePasswordSchema, updateAvatarSchema, toggle2faSchema } = require('../utils/joiSchemas');

// Semua route user memerlukan auth
router.use(auth);

/**
 * @swagger
 * /users/profile:
 *   get:
 *     tags: [Users]
 *     summary: Ambil profil user yang sedang login
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Profil berhasil diambil
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     email:
 *                       type: string
 *                       format: email
 *                     full_name:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     address:
 *                       type: string
 *                     avatar_url:
 *                       type: string
 *                     two_fa_enabled:
 *                       type: boolean
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Token tidak valid atau tidak diberikan
 */
router.get('/profile', userController.getProfile);

/**
 * @swagger
 * /users/profile:
 *   put:
 *     tags: [Users]
 *     summary: Update profil user (nama, telepon, alamat)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *                 example: Alief Budiman
 *               phone:
 *                 type: string
 *                 example: "081234567890"
 *               address:
 *                 type: string
 *                 example: Jl. Merdeka No. 17, Jakarta
 *     responses:
 *       200:
 *         description: Profil berhasil diperbarui
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Profil berhasil diperbarui
 *                 data:
 *                   type: object
 *       400:
 *         description: Validasi gagal
 *       401:
 *         description: Token tidak valid atau tidak diberikan
 */
router.put('/profile', validate(updateProfileSchema), userController.updateProfile);

/**
 * @swagger
 * /users/password:
 *   put:
 *     tags: [Users]
 *     summary: Ubah password user
 *     description: Memerlukan password saat ini untuk verifikasi sebelum mengubah ke password baru
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - current_password
 *               - new_password
 *             properties:
 *               current_password:
 *                 type: string
 *                 example: password123
 *               new_password:
 *                 type: string
 *                 example: newPassword456
 *     responses:
 *       200:
 *         description: Password berhasil diubah
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Password berhasil diubah
 *       400:
 *         description: Password saat ini salah atau validasi gagal
 *       401:
 *         description: Token tidak valid atau tidak diberikan
 */
router.put('/password', validate(changePasswordSchema), userController.changePassword);

/**
 * @swagger
 * /users/avatar:
 *   put:
 *     tags: [Users]
 *     summary: Update avatar URL user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - avatar_url
 *             properties:
 *               avatar_url:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/avatars/user123.jpg
 *     responses:
 *       200:
 *         description: Avatar berhasil diperbarui
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Avatar berhasil diperbarui
 *                 data:
 *                   type: object
 *       400:
 *         description: Validasi gagal
 *       401:
 *         description: Token tidak valid atau tidak diberikan
 */
router.put('/avatar', validate(updateAvatarSchema), userController.updateAvatar);

/**
 * @swagger
 * /users/2fa:
 *   put:
 *     tags: [Users]
 *     summary: Toggle pengaturan Two-Factor Authentication (2FA)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - enabled
 *             properties:
 *               enabled:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: 2FA berhasil diaktifkan/dinonaktifkan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: 2FA berhasil diaktifkan
 *                 data:
 *                   type: object
 *       400:
 *         description: Validasi gagal
 *       401:
 *         description: Token tidak valid atau tidak diberikan
 */
router.put('/2fa', validate(toggle2faSchema), userController.toggle2fa);

module.exports = router;
