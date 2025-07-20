const { body, param, query } = require('express-validator');

exports.validatePrompt = [
    body('user_id').isInt({ min: 1 }).withMessage('Valid user id required'),
    body('category_id').isInt({ min: 1 }).withMessage('Valid category ID required'),
    body('sub_category_id').optional().isInt({ min: 1 }),
    body('prompt').trim().isLength({ min: 10, max: 1000 }).withMessage('Prompt must be 10-1000 characters')
  ];
  
  exports.validateId = [
    param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer')
  ];
