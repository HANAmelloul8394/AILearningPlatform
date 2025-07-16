function validatePromptInput(prompt) {
    if (!prompt || typeof prompt !== 'string') {
      return { isValid: false, error: 'Prompt must be a non-empty string' };
    }
    
    if (prompt.trim().length < 10) {
      return { isValid: false, error: 'Prompt must be at least 10 characters' };
    }
    
    return { isValid: true, sanitized: prompt.trim() };
  }
  
  function validateUserId(userId) {
    const numericUserId = parseInt(userId);
    if (isNaN(numericUserId) || numericUserId < 1) {
      return { isValid: false, error: 'Invalid user ID' };
    }
    return { isValid: true, value: numericUserId };
  }
  
  function validateCategoryId(id, type = 'category') {
    const numericId = parseInt(id);
    if (isNaN(numericId) || numericId < 1) {
      return { isValid: false, error: `Invalid ${type} ID` };
    }
    return { isValid: true, value: numericId };
  }
  
  function validatePagination({ page = 1, limit = 10 } = {}) {
    const numericPage = parseInt(page);
    const numericLimit = parseInt(limit);
    
    if (isNaN(numericPage) || numericPage < 1) {
      return { isValid: false, errors: ['Invalid page number'] };
    }
    
    if (isNaN(numericLimit) || numericLimit < 1 || numericLimit > 100) {
      return { isValid: false, errors: ['Invalid limit'] };
    }
    
    return { 
      isValid: true, 
      values: { 
        page: numericPage, 
        limit: numericLimit,
        offset: (numericPage - 1) * numericLimit 
      } 
    };
  }
  
  function validateDateRange(start, end) {
    if (start && isNaN(Date.parse(start))) {
      return { isValid: false, errors: ['Invalid start date'] };
    }
    
    if (end && isNaN(Date.parse(end))) {
      return { isValid: false, errors: ['Invalid end date'] };
    }
    
    return { isValid: true };
  }
  
  module.exports = {
    validatePromptInput,
    validateUserId,
    validateCategoryId,
    validatePagination,
    validateDateRange
  };