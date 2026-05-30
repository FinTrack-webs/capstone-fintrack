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
            category_id: { type: 'integer', nullable: true, example: 1, description: 'Opsional. Jika tidak diisi, AI akan auto-classify. Isi dengan ID kategori (1=Gaji, 4=Bonus, 5=Makanan, 6=Transportasi, 13=Lainnya).' },
            amount: { type: 'integer', example: 50000 },
            description: { type: 'string', example: 'Beli nasi goreng di warung' },
            date: { type: 'string', format: 'date', example: '2026-05-17' },
            account_type: { type: 'string', enum: ['personal', 'business'], example: 'personal', description: 'Opsional. Default: personal.' },
            transaction_type: { type: 'string', enum: ['debit', 'credit'], example: 'debit', description: 'Opsional. Digunakan AI untuk prediksi lebih akurat.' },
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

        // User Profile
        UserProfile: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            full_name: { type: 'string', nullable: true, example: 'John Doe' },
            phone: { type: 'string', nullable: true, example: '081234567890' },
            address: { type: 'string', nullable: true, example: 'Jl. Merdeka No. 1' },
            avatar_url: { type: 'string', nullable: true },
            two_fa_enabled: { type: 'boolean', example: false },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        UpdateProfileRequest: {
          type: 'object',
          properties: {
            full_name: { type: 'string', example: 'John Doe' },
            phone: { type: 'string', example: '081234567890' },
            address: { type: 'string', example: 'Jl. Merdeka No. 1' },
          },
        },
        ChangePasswordRequest: {
          type: 'object',
          required: ['current_password', 'new_password'],
          properties: {
            current_password: { type: 'string', example: 'oldpassword123' },
            new_password: { type: 'string', minLength: 8, example: 'newpassword456' },
          },
        },
        UpdateAvatarRequest: {
          type: 'object',
          required: ['avatar_url'],
          properties: {
            avatar_url: { type: 'string', format: 'uri', example: 'https://example.com/avatar.jpg' },
          },
        },
        Toggle2faRequest: {
          type: 'object',
          required: ['enabled'],
          properties: {
            enabled: { type: 'boolean', example: true },
          },
        },

        // Savings Goals
        SavingsGoal: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            user_id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Target Umroh' },
            target_amount: { type: 'integer', example: 30000000 },
            current_amount: { type: 'integer', example: 22500000 },
            progress_percentage: { type: 'integer', example: 75 },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        CreateSavingsGoalRequest: {
          type: 'object',
          required: ['name', 'target_amount'],
          properties: {
            name: { type: 'string', example: 'Target Umroh' },
            target_amount: { type: 'integer', minimum: 1, example: 30000000 },
            current_amount: { type: 'integer', minimum: 0, example: 0 },
          },
        },

        // Analytics
        ExpenseDistribution: {
          type: 'object',
          properties: {
            category_name: { type: 'string', example: 'Makanan' },
            total: { type: 'integer', example: 1500000 },
            percentage: { type: 'integer', example: 40 },
          },
        },
        IncomeVsExpense: {
          type: 'object',
          properties: {
            label: { type: 'string', example: 'Jan' },
            income: { type: 'integer', example: 8000000 },
            expense: { type: 'integer', example: 3200000 },
          },
        },

        // AI Insights
        AIInsight: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['tip', 'warning', 'info'], example: 'tip' },
            message: { type: 'string', example: 'Hemat Rp200rb bulan depan dengan mengurangi kategori Hiburan.' },
            action_label: { type: 'string', nullable: true, example: 'Lihat Rincian' },
          },
        },
        FinancialHealthScore: {
          type: 'object',
          properties: {
            score: { type: 'integer', minimum: 0, maximum: 100, example: 75 },
            total_income: { type: 'integer', example: 8000000 },
            total_expense: { type: 'integer', example: 3200000 },
          },
        },

        // Pagination
        PaginationMeta: {
          type: 'object',
          properties: {
            total: { type: 'integer', example: 150 },
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 10 },
            total_pages: { type: 'integer', example: 15 },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
