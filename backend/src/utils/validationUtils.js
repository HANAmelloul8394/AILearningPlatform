function validatePromptInput(prompt) {
  const errors = [];
  if (!prompt) {
    return { isValid: false, error: 'Prompt is required and cannot be empty' };
  }

  if (typeof prompt !== 'string') {
    return { isValid: false, error: 'Prompt must be a string' };
  }

  const trimmedPrompt = prompt.trim();
  if (!trimmedPrompt) {
    return { isValid: false, error: 'Prompt cannot be only whitespace' };
  }

  if (trimmedPrompt.length > 100) {
    return {
      isValid: false,
      error: `Prompt exceeds maximum length of 100 characters. Current length: ${trimmedPrompt.length}`
    };
  }

  const invalidChars = trimmedPrompt.match(/[^א-תa-zA-Z0-9\s\.,!?'"()\-:;/@#$%^&*+=\[\]{}|\\`~_]/g);
  if (invalidChars) {
    return {
      isValid: false,
      error: `Prompt contains invalid characters: ${[...new Set(invalidChars)].join(', ')}`
    };
  }

  return { isValid: true, sanitized: trimmedPrompt };
}

function validateUserId(userId) {
  if (userId === null || userId === undefined) {
    return { isValid: false, error: 'User ID is required' };
  }

  const numericId = parseInt(userId);
  if (isNaN(numericId) || numericId < 1) {
    return { isValid: false, error: 'User ID must be a positive integer' };
  }
  return { isValid: true, value: numericId };
}

function validatePassword(userPass) {
  if (userPass === null || userPass === undefined) {
    return { isValid: false, error: 'User Pass is required' };
  }
  if (typeof userPass !== 'string' || userPass.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters' };
  }
  return { isValid: true, value: userPass };
}

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

function validatePhoneNumber(phone) {
  if (!phone) {
    return { isValid: false, error: 'Phone number is required' };
  }

  if (typeof phone !== 'string') {
    return { isValid: false, error: 'Phone number must be a string' };
  }

  const cleanPhone = phone.trim();

  // Basic format validation
  const phoneRegex = /^05\d{8}$/;
  if (!phoneRegex.test(cleanPhone)) {
    return {
      isValid: false,
      error: 'Invalid phone number format. Expected format: 0512345678'
    };
  }

  // Extract only digits
  const digitsOnly = cleanPhone.replace(/\D/g, '');

  if (digitsOnly.length !=10 ) {
    return {
      isValid: false,
      error: `Phone number must contain 10 digits. Found: ${digitsOnly.length}`
    };
  }

  return { isValid: true, sanitized: cleanPhone, digitsOnly };
}

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

function validatePagination({ page = 1, limit = 10 }) {
  const errors = [];
  const parsedPage = parseInt(page);
  const parsedLimit = parseInt(limit);

  if (isNaN(parsedPage) || parsedPage <= 0) {
    errors.push('Page must be a positive number');
  }

  if (isNaN(parsedLimit) || parsedLimit <= 0) {
    errors.push('Limit must be a positive number');
  }

  return {
    isValid: errors.length === 0,
    errors,
    values: {
      page: parsedPage,
      limit: parsedLimit,
      offset: (parsedPage - 1) * parsedLimit
    }
  };
}

function validateDateRange(startDate, endDate) {
  const errors = [];
  
  if (startDate && typeof startDate !== 'string') {
    errors.push('Start date must be a string');
  }
  
  if (endDate && typeof endDate !== 'string') {
    errors.push('End date must be a string');
  }
  
  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    errors.push('Start date cannot be after end date');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  validatePromptInput,
  validateUserId,
  validatePassword,
  validateCategoryId,
  validatePhoneNumber,
  validateUserName,
  validateCategoryName,
  validateCreatePromptData,
  validatePagination,
  validateDateRange
};