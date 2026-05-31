
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

    req[source] = value;
    next();
  };
};

module.exports = validate;