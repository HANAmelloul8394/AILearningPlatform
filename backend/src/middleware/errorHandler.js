const { AppError } = require('../utils/errorFactory');

function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const response = {
    success: false,
    error: err.name || 'InternalError',
    message: err.message || 'Something went wrong',
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(status).json(response);
}

module.exports = errorHandler;
