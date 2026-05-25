const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middlewares/validator');
const auth = require('../middlewares/auth');
const { registerSchema, loginSchema, refreshTokenSchema, logoutSchema } = require('../utils/joiSchemas');

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken);
router.post('/logout', validate(logoutSchema), authController.logout);
router.post('/logout-all', auth, authController.logoutAll);
router.post('/logout-all', auth, authController.logoutAll);

module.exports = router;
