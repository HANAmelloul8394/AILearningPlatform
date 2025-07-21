function validatePromptInput(prompt) {
    if (!prompt || typeof prompt !== 'string') {
      return 'Prompt must be a non-empty string';
    }
    
    if (prompt.trim().length < 10) {
      return 'Prompt must be at least 10 characters';
    }
    
    return null; 
  }
  
  function validateUserId(userId) {
    const numericUserId = parseInt(userId);
    if (isNaN(numericUserId) || numericUserId < 1) {
      return 'Invalid user ID';
    }
    return null;
  }
  
  function validateCategoryId(id, type = 'category') {
    const numericId = parseInt(id);
    if (isNaN(numericId) || numericId < 1) {
      return `Invalid ${type} ID`;
    }
    return null;
  }
  
  function validatePagination({ page = 1, limit = 10 } = {}) {
    const numericPage = parseInt(page);
    const numericLimit = parseInt(limit);
    
    if (isNaN(numericPage) || numericPage < 1) {
      return { error: 'Invalid page number' };
    }
    
    if (isNaN(numericLimit) || numericLimit < 1 || numericLimit > 100) {
      return { error: 'Invalid limit' };
    }
    
    return {
      page: numericPage,
      limit: numericLimit,
      offset: (numericPage - 1) * numericLimit
    };
  }
  
  function validateDateRange(start, end) {
    const errors = [];
    
    if (start && isNaN(Date.parse(start))) {
      errors.push('Invalid start date');
    }
    
    if (end && isNaN(Date.parse(end))) {
      errors.push('Invalid end date');
    }
    
    return errors.length > 0 ? errors : null;
  }
  
  module.exports = {
    validatePromptInput,
    validateUserId,
    validateCategoryId,
    validatePagination,
    validateDateRange
  };

 