/**
 * Comprehensive validation utilities for AI Learning Platform
 * Provides detailed validation for all input types with clear error messages
 */

/**
 * Validates prompt input with comprehensive checks
 * @param {string} prompt - The user's learning prompt
 * @returns {Object} validation result with isValid boolean and error details
 */
function validatePromptInput(prompt) {
    const errors = [];
    
    // Basic type and existence check
    if (!prompt) {
      return { isValid: false, error: 'Prompt is required and cannot be empty' };
    }
    
    if (typeof prompt !== 'string') {
      return { isValid: false, error: 'Prompt must be a string' };
    }
    
    // Trim and check again after removing whitespace
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      return { isValid: false, error: 'Prompt cannot be only whitespace' };
    }
    
    // Length validation
    if (trimmedPrompt.length < 10) {
      return { 
        isValid: false, 
        error: `Prompt must be at least 10 characters long. Current length: ${trimmedPrompt.length}` 
      };
    }
    
    if (trimmedPrompt.length > 2000) {
      return { 
        isValid: false, 
        error: `Prompt exceeds maximum length of 2000 characters. Current length: ${trimmedPrompt.length}` 
      };
    }
    
    // Content quality checks
    const wordCount = trimmedPrompt.split(/\s+/).length;
    if (wordCount < 3) {
      return { 
        isValid: false, 
        error: `Prompt must contain at least 3 words. Current word count: ${wordCount}` 
      };
    }
    
    // Character validation - Allow Hebrew, English, numbers, and common punctuation
    const invalidChars = trimmedPrompt.match(/[^א-תa-zA-Z0-9\s\.,!?'"()\-:;/@#$%^&*+=\[\]{}|\\`~_]/g);
    if (invalidChars) {
      return { 
        isValid: false, 
        error: `Prompt contains invalid characters: ${[...new Set(invalidChars)].join(', ')}` 
      };
    }
    
    // Check for potential spam or inappropriate content
    const spamPatterns = [
      /(.)\1{4,}/gi, // Repeated characters (more than 4 in a row)
      /^[A-Z\s!]{20,}$/gi, // All caps with exclamation marks
    ];
    
    for (const pattern of spamPatterns) {
      if (pattern.test(trimmedPrompt)) {
        return { 
          isValid: false, 
          error: 'Prompt appears to contain spam or inappropriate formatting' 
        };
      }
    }
    
    return { isValid: true, sanitized: trimmedPrompt };
  }
  
  /**
   * Validates user ID with detailed checks
   * @param {any} userId - User identifier to validate
   * @returns {Object} validation result
   */
  function validateUserId(userId) {
    if (userId === null || userId === undefined) {
      return { isValid: false, error: 'User ID is required' };
    }
    
    const numericUserId = parseInt(userId);
    
    if (isNaN(numericUserId)) {
      return { isValid: false, error: `User ID must be a valid number. Received: ${typeof userId}` };
    }
    
    if (numericUserId < 1) {
      return { isValid: false, error: `User ID must be a positive integer. Received: ${numericUserId}` };
    }
    
    if (numericUserId > 2147483647) { // PostgreSQL INTEGER max value
      return { isValid: false, error: `User ID exceeds maximum allowed value` };
    }
    
    return { isValid: true, value: numericUserId };
  }
  
  /**
   * Validates category/sub-category ID
   * @param {any} id - Category ID to validate
   * @param {string} type - Type description for error messages ('category' or 'sub-category')
   * @returns {Object} validation result
   */
  function validateCategoryId(id, type = 'category') {
    if (id === null || id === undefined) {
      return { isValid: false, error: `${type} ID is required` };
    }
    
    const numericId = parseInt(id);
    
    if (isNaN(numericId)) {
      return { isValid: false, error: `${type} ID must be a valid number. Received: ${typeof id}` };
    }
    
    if (numericId < 1) {
      return { isValid: false, error: `${type} ID must be a positive integer. Received: ${numericId}` };
    }
    
    if (numericId > 2147483647) {
      return { isValid: false, error: `${type} ID exceeds maximum allowed value` };
    }
    
    return { isValid: true, value: numericId };
  }
  
  /**
   * Validates pagination parameters
   * @param {Object} params - Pagination parameters {page, limit}
   * @returns {Object} validation result
   */
  function validatePagination({ page = 1, limit = 10 } = {}) {
    const errors = [];
    
    // Validate page
    const numericPage = parseInt(page);
    if (isNaN(numericPage) || numericPage < 1) {
      errors.push(`Page must be a positive integer. Received: ${page}`);
    } else if (numericPage > 10000) {
      errors.push(`Page number too high. Maximum allowed: 10000`);
    }
    
    // Validate limit
    const numericLimit = parseInt(limit);
    if (isNaN(numericLimit) || numericLimit < 1) {
      errors.push(`Limit must be a positive integer. Received: ${limit}`);
    } else if (numericLimit > 100) {
      errors.push(`Limit exceeds maximum of 100. Received: ${numericLimit}`);
    }
    
    if (errors.length > 0) {
      return { isValid: false, errors };
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
  
  /**
   * Validates date range parameters
   * @param {string} start - Start date string
   * @param {string} end - End date string
   * @returns {Object} validation result
   */
  function validateDateRange(start, end) {
    const errors = [];
    let startDate = null;
    let endDate = null;
    
    // Validate start date
    if (start) {
      startDate = new Date(start);
      if (isNaN(startDate.getTime())) {
        errors.push(`Invalid start date format: ${start}. Expected format: YYYY-MM-DD or ISO string`);
      } else {
        // Check if date is not too far in the past or future
        const now = new Date();
        const minDate = new Date('2020-01-01');
        const maxDate = new Date(now.getFullYear() + 1, 11, 31);
        
        if (startDate < minDate) {
          errors.push(`Start date cannot be before ${minDate.toISOString().split('T')[0]}`);
        }
        if (startDate > maxDate) {
          errors.push(`Start date cannot be after ${maxDate.toISOString().split('T')[0]}`);
        }
      }
    }
    
    // Validate end date
    if (end) {
      endDate = new Date(end);
      if (isNaN(endDate.getTime())) {
        errors.push(`Invalid end date format: ${end}. Expected format: YYYY-MM-DD or ISO string`);
      } else {
        const now = new Date();
        const minDate = new Date('2020-01-01');
        const maxDate = new Date(now.getFullYear() + 1, 11, 31);
        
        if (endDate < minDate) {
          errors.push(`End date cannot be before ${minDate.toISOString().split('T')[0]}`);
        }
        if (endDate > maxDate) {
          errors.push(`End date cannot be after ${maxDate.toISOString().split('T')[0]}`);
        }
      }
    }
    
    // Validate date range logic
    if (startDate && endDate) {
      if (startDate >= endDate) {
        errors.push(`Start date must be before end date. Start: ${start}, End: ${end}`);
      }
      
      // Check for reasonable date range (not more than 5 years)
      const diffYears = (endDate - startDate) / (1000 * 60 * 60 * 24 * 365);
      if (diffYears > 5) {
        errors.push(`Date range cannot exceed 5 years. Current range: ${diffYears.toFixed(1)} years`);
      }
    }
    
    if (errors.length > 0) {
      return { isValid: false, errors };
    }
    
    return { 
      isValid: true, 
      values: { 
        startDate: startDate ? startDate.toISOString() : null,
        endDate: endDate ? endDate.toISOString() : null 
      } 
    };
  }
  
  /**
   * Validates phone number format
   * @param {string} phone - Phone number to validate
   * @returns {Object} validation result
   */
  function validatePhoneNumber(phone) {
    if (!phone) {
      return { isValid: false, error: 'Phone number is required' };
    }
    
    if (typeof phone !== 'string') {
      return { isValid: false, error: 'Phone number must be a string' };
    }
    
    const cleanPhone = phone.trim();
    
    // Basic format validation
    const phoneRegex = /^[\+]?[1-9][\d\-\s\(\)]{7,15}$/;
    if (!phoneRegex.test(cleanPhone)) {
      return { 
        isValid: false, 
        error: 'Invalid phone number format. Expected format: +1234567890 or (123) 456-7890' 
      };
    }
    
    // Extract only digits
    const digitsOnly = cleanPhone.replace(/\D/g, '');
    
    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      return { 
        isValid: false, 
        error: `Phone number must contain 7-15 digits. Found: ${digitsOnly.length}` 
      };
    }
    
    return { isValid: true, sanitized: cleanPhone, digitsOnly };
  }
  
  /**
   * Validates user name
   * @param {string} name - User name to validate
   * @returns {Object} validation result
   */
  function validateUserName(name) {
    if (!name) {
      return { isValid: false, error: 'Name is required' };
    }
    
    if (typeof name !== 'string') {
      return { isValid: false, error: 'Name must be a string' };
    }
    
    const trimmedName = name.trim();
    
    if (trimmedName.length < 2) {
      return { 
        isValid: false, 
        error: `Name must be at least 2 characters long. Current length: ${trimmedName.length}` 
      };
    }
    
    if (trimmedName.length > 100) {
      return { 
        isValid: false, 
        error: `Name exceeds maximum length of 100 characters. Current length: ${trimmedName.length}` 
      };
    }
    
    // Allow Hebrew, English, spaces, hyphens, apostrophes
    const nameRegex = /^[א-תa-zA-Z\s\-'\.]+$/;
    if (!nameRegex.test(trimmedName)) {
      return { 
        isValid: false, 
        error: 'Name contains invalid characters. Only letters, spaces, hyphens, and apostrophes are allowed' 
      };
    }
    
    return { isValid: true, sanitized: trimmedName };
  }
  
  /**
   * Validates category name
   * @param {string} categoryName - Category name to validate
   * @returns {Object} validation result
   */
  function validateCategoryName(categoryName) {
    if (!categoryName) {
      return { isValid: false, error: 'Category name is required' };
    }
    
    if (typeof categoryName !== 'string') {
      return { isValid: false, error: 'Category name must be a string' };
    }
    
    const trimmedName = categoryName.trim();
    
    if (trimmedName.length < 2) {
      return { 
        isValid: false, 
        error: `Category name must be at least 2 characters long. Current length: ${trimmedName.length}` 
      };
    }
    
    if (trimmedName.length > 50) {
      return { 
        isValid: false, 
        error: `Category name exceeds maximum length of 50 characters. Current length: ${trimmedName.length}` 
      };
    }
    
    // Allow Hebrew, English, numbers, spaces, hyphens
    const categoryRegex = /^[א-תa-zA-Z0-9\s\-]+$/;
    if (!categoryRegex.test(trimmedName)) {
      return { 
        isValid: false, 
        error: 'Category name contains invalid characters. Only letters, numbers, spaces, and hyphens are allowed' 
      };
    }
    
    return { isValid: true, sanitized: trimmedName };
  }
  
  /**
   * Validates export parameters
   * @param {string} type - Export type
   * @param {string} format - Export format
   * @returns {Object} validation result
   */
  function validateExportParams(type, format = 'json') {
    const validTypes = ['users', 'prompts', 'categories'];
    const validFormats = ['json', 'csv'];
    
    if (!type) {
      return { isValid: false, error: 'Export type is required' };
    }
    
    if (!validTypes.includes(type)) {
      return { 
        isValid: false, 
        error: `Invalid export type: ${type}. Valid types: ${validTypes.join(', ')}` 
      };
    }
    
    if (format && !validFormats.includes(format)) {
      return { 
        isValid: false, 
        error: `Invalid export format: ${format}. Valid formats: ${validFormats.join(', ')}` 
      };
    }
    
    return { isValid: true, values: { type, format } };
  }
  
  /**
   * Comprehensive validation for creating a prompt
   * @param {Object} promptData - Complete prompt data object
   * @returns {Object} validation result with all field validations
   */
  function validateCreatePromptData(promptData) {
    const { user_id, category_id, sub_category_id, prompt } = promptData;
    const errors = [];
    
    const userValidation = validateUserId(user_id);
    if (!userValidation.isValid) {
      errors.push(`User ID: ${userValidation.error}`);
    }
    
    const categoryValidation = validateCategoryId(category_id, 'category');
    if (!categoryValidation.isValid) {
      errors.push(`Category: ${categoryValidation.error}`);
    }
    
    const subCategoryValidation = validateCategoryId(sub_category_id, 'sub-category');
    if (!subCategoryValidation.isValid) {
      errors.push(`Sub-category: ${subCategoryValidation.error}`);
    }
    
    const promptValidation = validatePromptInput(prompt);
    if (!promptValidation.isValid) {
      errors.push(`Prompt: ${promptValidation.error}`);
    }
    
    if (errors.length > 0) {
      return { isValid: false, errors };
    }
    
    return { 
      isValid: true, 
      sanitizedData: {
        user_id: userValidation.value,
        category_id: categoryValidation.value,
        sub_category_id: subCategoryValidation.value,
        prompt: promptValidation.sanitized
      }
    };
  }
  
  module.exports = {
    validatePromptInput,
    validateUserId,
    validateCategoryId,
    validatePagination,
    validateDateRange,
    validatePhoneNumber,
    validateUserName,
    validateCategoryName,
    validateExportParams,
    validateCreatePromptData
  };