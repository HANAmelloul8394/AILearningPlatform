// utils/validation.js

export function validatePassword(password) { 
    return password && password.length >= 6;
    }
    
    export function validatePhone(phone) { 
    return /^05\d{8}$/.test(phone);
    }
    
    export function validateNotEmpty(str) { 
    return str && str.trim().length > 0;
    }
    
    export function validateTitle(title) { 
    return validateNotEmpty(title) && title.length <= 255;
    }
    
    export function validateFileType(file, allowedTypes) { 
    if (!file) return false; 
    return allowedTypes.includes(file.type);
    }
    
    export function validateDate(date) { 
    return /^\d{4}-\d{2}-\d{2}$/.test(date);
    }
    
    export function validateName(name) { 
    return /^[\p{L}\s.]{2,100}$/u.test(name);
    }
    
    export function validateTextLength(text, min = 1, max = 1000) { 
    const length = text ? text.trim().length : 0; 
    return length >= min && length <= max;
    }
    
    export function validateNumeric(value) { 
    return /^\d+$/.test(value);
    }
    
    export function validateFileName(fileName) { 
    return /^[\w\-. ]+$/.test(fileName);
    }
    
    export function validateFileSize(file, maxSizeInMB) { 
    if (!file) return false; 
    return file.size <= maxSizeInMB * 1024 * 1024;
    }
    
    export function validateComment(comment) { 
    return validateTextLength(comment, 1, 1000) && 
    !/<[a-z][\s\S]*>/i.test(comment);
    }
    
    // Validate prompt content
    export function validatePrompt(prompt) { 
    return validateTextLength(prompt, 10, 1000);
    }
    
    // Validate category selection
    export function validateCategoryId(id) { 
    return id && parseInt(id) > 0;
    }
    
    export const VALIDATION_MESSAGES = {
    PASSWORD: 'Password must be at least 6 characters',
    PHONE: 'Invalid phone number',
    REQUIRED: 'Required field',
    TITLE: 'Title must be up to 255 characters',
    NAME: 'Name must contain only letters and spaces (2-100 characters)',
    COMMENT: 'Comment must contain between 1 and 1000 characters and cannot contain HTML code',
    FILE_TYPE: 'Invalid file type',
    FILE_SIZE: 'File size exceeds the allowed limit',
    FILE_NAME: 'File name contains invalid characters',
    DATE: 'Invalid date (year-month-day)',
    NUMERIC: 'Numbers must be entered only',
    PROMPT: 'Prompt must contain between 10 and 1000 characters',
    CATEGORY: 'A category must be selected'
    };