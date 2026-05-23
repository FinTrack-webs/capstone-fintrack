const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FinTrack API',
      version: '1.0.0',
      description: 'API dokumentasi untuk FinTrack — Aplikasi Pencatat Keuangan Pribadi',
      contact: {
        name: 'FinTrack Team',
      },
    },
    servers: [
      {
        url: '/api',
        description: 'API Base URL',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Masukkan access token JWT',
        },
      },
      schemas: {
        // Auth
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            password: { type: 'string', minLength: 6, example: 'password123' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            password: { type: 'string', example: 'password123' },
          },
        },
        RefreshTokenRequest: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: { type: 'string', example: 'eyJhbGciOiJI...' },
          },
        },
        LogoutRequest: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: { type: 'string', example: 'eyJhbGciOiJI...' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    email: { type: 'string', format: 'email' },
                  },
                },
                accessToken: { type: 'string' },
                refreshToken: { type: 'string' },
              },
            },
          },
        },

        // Category
        Category: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Makanan' },
            type: { type: 'string', enum: ['income', 'expense'], example: 'expense' },
            icon_url: { type: 'string', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        CreateCategoryRequest: {
          type: 'object',
          required: ['name', 'type'],
          properties: {
            name: { type: 'string', example: 'Makanan' },
            type: { type: 'string', enum: ['income', 'expense'], example: 'expense' },
            icon_url: { type: 'string', nullable: true },
          },
        },

        // Transaction
        Transaction: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            user_id: { type: 'string', format: 'uuid' },
            category_id: { type: 'integer', nullable: true },
            amount: { type: 'integer', example: 50000 },
            description: { type: 'string', example: 'Beli nasi goreng' },
            date: { type: 'string', format: 'date', example: '2026-05-17' },
            classification_status: { type: 'string', enum: ['pending', 'classified', 'failed'] },
            created_at: { type: 'string', format: 'date-time' },
            category_name: { type: 'string', nullable: true },
            category_type: { type: 'string', nullable: true },
          },
        },
        CreateTransactionRequest: {
          type: 'object',
          required: ['amount', 'description', 'date'],
          properties: {
            category_id: { type: 'integer', nullable: true, description: 'Opsional. Jika tidak diisi, AI Mock akan auto-classify.' },
            amount: { type: 'integer', example: 50000 },
            description: { type: 'string', example: 'Beli nasi goreng di warung' },
            date: { type: 'string', format: 'date', example: '2026-05-17' },
          },
        },

        // Dashboard
        DashboardSummary: {
          type: 'object',
          properties: {
            totalIncome: { type: 'integer', example: 5000000 },
            totalExpense: { type: 'integer', example: 2500000 },
            balance: { type: 'integer', example: 2500000 },
            breakdown: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  category_id: { type: 'integer' },
                  category_name: { type: 'string' },
                  category_type: { type: 'string' },
                  total_amount: { type: 'string' },
                  transaction_count: { type: 'string' },
                },
              },
            },
          },
        },

        // Common
        ErrorResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'error' },
            message: { type: 'string' },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            message: { type: 'string' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
