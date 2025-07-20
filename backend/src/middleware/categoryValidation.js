const { body, param, query } = require('express-validator');
exports.validateCategory = [
    body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Category name must be between 2-50 characters')
  ];
  
  exports.validateSubCategory = [
    body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Sub-category name must be between 2-50 characters'),
    body('category_id').isInt({ min: 1 }).withMessage('Valid category ID required')
  ];
  
  exports.validateId = [
    param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer')
  ];
  
  exports.validateCategoryId = [
    param('categoryId').isInt({ min: 1 }).withMessage('Category ID must be a positive integer')
  ];
  