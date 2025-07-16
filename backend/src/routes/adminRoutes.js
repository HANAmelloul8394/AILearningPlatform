const express = require('express');
const { param, query } = require('express-validator');
const adminController = require('../controllers/adminController');

const router = express.Router();

const validatePagination = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
];

router.get('/dashboard', adminController.getDashboardStats);
router.get('/users', validatePagination, adminController.getAllUsersWithHistory);
router.get('/prompts', validatePagination, adminController.getAllPromptsWithDetails);

router.get('/users/:userId/analytics',
  param('userId').isInt({ min: 1 }),
  adminController.getUserAnalytics
);

router.get('/categories/analytics', adminController.getCategoryAnalytics);

router.get('/export',
  [
    query('type').isIn(['users', 'prompts', 'categories']),
    query('format').optional().isIn(['json', 'csv'])
  ],
  adminController.exportData
);

module.exports = router;
