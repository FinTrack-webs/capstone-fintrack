require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const logger = require('./utils/logger');

const app = express();
const HOST = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT || 3000;

// Render & reverse proxy: agar req.protocol = https di production
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Middlewares
app.use(cors());
app.use(express.json()); // Parsing JSON request body
app.use(express.urlencoded({ extended: true }));

// Request Logger (development)
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'FinTrack API Docs',
}));

// Routes
app.use('/api', routes);

// Route Utama (Health Check)
app.get('/', (req, res) => {
  const baseUrl = req.get('host')
    ? `${req.protocol}://${req.get('host')}`
    : `http://localhost:${PORT}`;
  res.json({
    message: 'Selamat datang di Fintrack API!',
    docs: `${baseUrl}/api-docs`,
    health: `${baseUrl}/api/ping`,
  });
});

// Global Error Handler (harus di paling bawah)
app.use(errorHandler);

// Menjalankan Server
app.listen(PORT, HOST, () => {
  logger.info(`Server Fintrack berjalan di port http://${HOST}:${PORT}`);
  logger.info(`API Docs tersedia di http://${HOST}:${PORT}/api-docs`);
});
