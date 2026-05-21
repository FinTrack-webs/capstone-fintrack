const app = require('./app');
const logger = require('./utils/logger');
const { pool } = require('./config/db');

const HOST = process.env.HOST || '0.0.0.0'; // Gunakan 0.0.0.0 untuk deployment cloud
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, HOST, () => {
  logger.info(`Server Fintrack berjalan di http://${HOST}:${PORT}`);
  logger.info(`API Docs tersedia di http://${HOST}:${PORT}/api-docs`);
});

// Graceful Shutdown
const shutdown = (signal) => {
  logger.info(`${signal} diterima. Menutup server...`);
  server.close(async () => {
    logger.info('Server ditutup.');
    try {
      await pool.end();
      logger.info('Pool koneksi database ditutup.');
      process.exit(0);
    } catch (err) {
      logger.error('Error saat menutup pool database:', err.message);
      process.exit(1);
    }
  });

  // Jika server tidak menutup dalam 10 detik, paksa keluar
  setTimeout(() => {
    logger.error('Gagal menutup server secara normal, memaksa keluar...');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
