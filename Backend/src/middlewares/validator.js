/**
 * Joi Validator Middleware Factory
 * Membuat middleware validasi berdasarkan schema Joi yang diberikan
 * @param {Joi.Schema} schema - Schema Joi untuk validasi
 * @param {string} source - Sumber data: 'body', 'params', atau 'query'
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        status: 'error',
        message: 'Validasi gagal',
        errors: error.details.map((d) => d.message),
      });
    }

    // Replace request source dengan data yang sudah divalidasi dan di-strip
    req[source] = value;
    next();
  };
};

module.exports = validate;
