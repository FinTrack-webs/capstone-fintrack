const Joi = require('joi');

// AUTH SCHEMA
const registerSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).required().messages({
    'string.email': 'Format email tidak valid',
    'any.required': 'Email wajib diisi',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password minimal 6 karakter',
    'any.required': 'Password wajib diisi',
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).required().messages({
    'string.email': 'Format email tidak valid',
    'any.required': 'Email wajib diisi',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password wajib diisi',
  }),
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'Refresh token wajib diisi',
  }),
});

const logoutSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'Refresh token wajib diisi untuk logout',
  }),
});

// TRANSACTION SCHEMA
const createTransactionSchema = Joi.object({
  category_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'Category ID harus berupa angka',
    'number.positive': 'Category ID harus positif',
  }),
  amount: Joi.number().integer().positive().required().messages({
    'number.base': 'Amount harus berupa angka',
    'number.positive': 'Amount harus lebih dari 0',
    'any.required': 'Amount wajib diisi',
  }),
  description: Joi.string().min(1).max(500).required().messages({
    'string.min': 'Deskripsi tidak boleh kosong',
    'string.max': 'Deskripsi maksimal 500 karakter',
    'any.required': 'Deskripsi wajib diisi',
  }),
  date: Joi.date().iso().required().messages({
    'date.format': 'Format tanggal harus ISO (YYYY-MM-DD)',
    'any.required': 'Tanggal wajib diisi',
  }),
  account_type: Joi.string().valid('personal', 'business').default('personal').messages({
    'any.only': 'Account type harus personal atau business',
  }),
  transaction_type: Joi.string().optional().messages({
    'string.base': 'Transaction type harus berupa string',
  }),
});

const updateTransactionSchema = Joi.object({
  category_id: Joi.number().integer().positive().optional(),
  amount: Joi.number().integer().positive().optional(),
  description: Joi.string().min(1).max(500).optional(),
  date: Joi.date().iso().optional(),
}).min(1).messages({
  'object.min': 'Minimal satu field harus diisi untuk update',
});

// CATEGORY SCHEMA
const createCategorySchema = Joi.object({
  name: Joi.string().min(1).max(100).required().messages({
    'string.min': 'Nama kategori tidak boleh kosong',
    'string.max': 'Nama kategori maksimal 100 karakter',
    'any.required': 'Nama kategori wajib diisi',
  }),
  type: Joi.string().valid('income', 'expense').required().messages({
    'any.only': 'Type harus income atau expense',
    'any.required': 'Type wajib diisi',
  }),
  icon_url: Joi.string().uri().optional().allow('', null),
});

const updateCategorySchema = Joi.object({
  name: Joi.string().min(1).max(100).optional(),
  type: Joi.string().valid('income', 'expense').optional(),
  icon_url: Joi.string().uri().optional().allow('', null),
}).min(1).messages({
  'object.min': 'Minimal satu field harus diisi untuk update',
});

// AI PREDICT SCHEMA
const predictCategorySchema = Joi.object({
  description: Joi.string().required().messages({
    'any.required': 'Deskripsi wajib diisi',
  }),
  transaction_type: Joi.string().required().messages({
    'any.required': 'Transaction type wajib diisi',
  }),
  account_type: Joi.string().valid('personal', 'business').default('personal').messages({
    'any.only': 'Account type harus personal atau business',
  }),
});

// USER PROFILE SCHEMA
const updateProfileSchema = Joi.object({
  full_name: Joi.string().max(255).optional().messages({
    'string.max': 'Nama lengkap maksimal 255 karakter',
  }),
  phone: Joi.string().max(20).optional().messages({
    'string.max': 'Nomor telepon maksimal 20 karakter',
  }),
  address: Joi.string().optional().messages({
    'string.base': 'Alamat harus berupa string',
  }),
}).min(1).messages({
  'object.min': 'Minimal satu field harus diisi untuk update profil',
});

const changePasswordSchema = Joi.object({
  current_password: Joi.string().required().messages({
    'any.required': 'Password saat ini wajib diisi',
  }),
  new_password: Joi.string().min(8).required().messages({
    'string.min': 'Password baru minimal 8 karakter',
    'any.required': 'Password baru wajib diisi',
  }),
});

const updateAvatarSchema = Joi.object({
  avatar_url: Joi.string().uri().required().messages({
    'string.uri': 'URL avatar harus berupa URI yang valid',
    'any.required': 'URL avatar wajib diisi',
  }),
});

const toggle2faSchema = Joi.object({
  enabled: Joi.boolean().required().messages({
    'boolean.base': 'Field enabled harus berupa boolean',
    'any.required': 'Field enabled wajib diisi',
  }),
});

// SAVINGS GOAL SCHEMA
const createSavingsGoalSchema = Joi.object({
  name: Joi.string().min(1).max(255).required().messages({
    'string.min': 'Nama target tidak boleh kosong',
    'string.max': 'Nama target maksimal 255 karakter',
    'any.required': 'Nama target wajib diisi',
  }),
  target_amount: Joi.number().integer().min(1).required().messages({
    'number.base': 'Jumlah target harus berupa angka',
    'number.min': 'Jumlah target harus lebih dari 0',
    'any.required': 'Jumlah target wajib diisi',
  }),
  current_amount: Joi.number().integer().min(0).default(0).messages({
    'number.base': 'Jumlah terkini harus berupa angka',
    'number.min': 'Jumlah terkini tidak boleh negatif',
  }),
});

const updateSavingsGoalSchema = Joi.object({
  name: Joi.string().min(1).max(255).optional(),
  target_amount: Joi.number().integer().min(1).optional(),
  current_amount: Joi.number().integer().min(0).optional(),
}).min(1).messages({
  'object.min': 'Minimal satu field harus diisi untuk update',
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
  createTransactionSchema,
  updateTransactionSchema,
  createCategorySchema,
  updateCategorySchema,
  predictCategorySchema,
  updateProfileSchema,
  changePasswordSchema,
  updateAvatarSchema,
  toggle2faSchema,
  createSavingsGoalSchema,
  updateSavingsGoalSchema,
};
