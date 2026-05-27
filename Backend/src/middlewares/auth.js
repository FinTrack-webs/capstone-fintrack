const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const logger = require('../utils/logger');

//Verifikasi JWT access token dari header Authorization: Bearer <token>
const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'error',
      message: 'Akses ditolak. Token tidak ditemukan.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    req.user = decoded; // { userId, email }
    next();
  } catch (err) {
    logger.warn('Token tidak valid atau sudah expired', err.message);
    return res.status(401).json({
      status: 'error',
      message: 'Token tidak valid atau sudah expired.',
    });
  }
};

module.exports = auth;
