const { body, param, query } = require('express-validator');

exports.validateUserCreation = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('phone').trim().isMobilePhone('any').withMessage('Invalid phone number'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

exports.validateUserId = [
  param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer')
];
