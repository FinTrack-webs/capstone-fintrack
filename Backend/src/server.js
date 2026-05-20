const app = require('./app');
const logger = require('./utils/logger');

const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 3000;

app.listen(PORT, HOST, () => {
  logger.info(`Server Fintrack berjalan di http://${HOST}:${PORT}`);
  logger.info(`API Docs tersedia di http://${HOST}:${PORT}/api-docs`);
});
