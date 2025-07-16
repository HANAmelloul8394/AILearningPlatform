class AppError extends Error {
    constructor(message, status = 500, type = 'AppError') {
      super(message);
      this.status = status;
      this.name = type;
    }
  }
  
  class ValidationError extends AppError {
    constructor(message) {
      super(message, 400, 'ValidationError');
    }
  }
  
  class NotFoundError extends AppError {
    constructor(message) {
      super(message, 404, 'NotFoundError');
    }
  }
  
  class DatabaseError extends AppError {
    constructor(message) {
      super(message, 500, 'DatabaseError');
    }
  }
  
  class UnauthorizedError extends AppError {
    constructor(message) {
      super(message, 401, 'UnauthorizedError');
    }
  }
  
  module.exports = {
    AppError,
    ValidationError,
    NotFoundError,
    DatabaseError,
    UnauthorizedError,
  };
  