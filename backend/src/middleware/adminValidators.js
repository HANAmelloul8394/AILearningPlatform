const { param, query } = require('express-validator');

exports.validateUserId = [
  param('userId').isInt({ min: 1 }).toInt()
];

