const express = require('express');
const { body, param, query } = require('express-validator');
const userController = require('../controllers/userController');

const router = express.Router();

const validateUser = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2-100 characters'),
  body('phone').trim().isMobilePhone('any').withMessage('Phone must be a valid mobile number')
];

const validateId = [
  param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer')
];

const validatePagination = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
];

router.post('/', validateUser, userController.createUser);
router.get('/', userController.getAllUsers);
router.get('/:id', validateId, userController.getUserById);
router.get('/:id/history', [...validateId, ...validatePagination], userController.getUserHistory);

module.exports = router;