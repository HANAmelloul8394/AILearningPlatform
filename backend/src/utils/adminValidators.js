const { param, query } = require('express-validator');

exports.validatePagination = [
  query('page').optional().isInt({ min: 1, max: 10000 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
];

exports.validateUserId = [
  param('userId').isInt({ min: 1 }).toInt()
];

exports.validateDateRange = [
  query('startDate').optional().isISO8601().toDate(),
  query('endDate').optional().isISO8601().toDate()
];

exports.validateExport = [
  query('type').isIn(['users', 'prompts', 'categories']),
  query('format').optional().isIn(['json', 'csv']).default('json')
];
