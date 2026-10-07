exports.notFound = (req, res) => res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });

exports.errorHandler = (err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || 'Server error';

  if (err.code === 11000) {
    status = 409;
    message = err.keyPattern && err.keyPattern.receiptNumber ? 'Receipt number already exists.' : 'Duplicate value already exists.';
  }
  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }
  if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid id';
  }
  if (status === 500) console.error(err);

  res.status(status).json({
    success: false,
    message,
    errors: err.errors,
    ...(process.env.NODE_ENV === 'development' && status === 500 ? { stack: err.stack } : {}),
  });
};
