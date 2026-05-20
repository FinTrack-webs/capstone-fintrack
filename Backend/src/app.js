require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// Vercel / reverse proxy: agar req.protocol = https di production
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'FinTrack API Docs',
}));

app.use('/api', routes);

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

app.use(errorHandler);

module.exports = app;
