class AppError extends Error {
    constructor(message, statusCode = 500) {
      super(message);
      this.statusCode = statusCode;
      this.status = statusCode;
      this.name = this.constructor.name;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  class ValidationError extends AppError {
    constructor(message) {
      super(message, 400);
    }
  }
  
  class NotFoundError extends AppError {
    constructor(message) {
      super(message, 404);
    }
  }
  
  class AuthenticationError extends AppError {
    constructor(message) {
      super(message, 401);
    }
  }
  
  class AuthorizationError extends AppError {
    constructor(message) {
      super(message, 403);
    }
  }
  
  module.exports = {
    AppError,
    ValidationError,
    NotFoundError,
    AuthenticationError,
    AuthorizationError
  };