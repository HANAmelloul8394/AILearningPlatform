const { ValidationError, NotFoundError ,AuthenticationError, AuthorizationError } = require('../utils/errorFactory');

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      error: 'ValidationError',
      message: err.message,
      details: err.errors || []
    });
  }
  
  if (err instanceof NotFoundError) {
    return res.status(404).json({
      success: false,
      error: 'NotFoundError',
      message: err.message
    });
  }
  
  if (err instanceof AuthenticationError) {
    return res.status(401).json({ success: false, error: 'AuthenticationError', message: err.message });
  }

  if (err instanceof AuthorizationError) {
    return res.status(403).json({ success: false, error: 'AuthorizationError', message: err.message });
  }

  // MySQL errors
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({
      success: false,
      error: 'DuplicateError',
      message: 'Duplicate entry detected'
    });
  }

  // Default error
  const status = err.status || 500;

  const response = {
    success: false,
    error: err.name || 'InternalError',
    message: err.message || 'Something went wrong'
  };

  res.status(status).json(response);
};

module.exports = { errorHandler };
