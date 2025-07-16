const express = require('express');
const { body, param } = require('express-validator');
const categoryController = require('../controllers/categoryController');

const router = express.Router();

router.post('/',
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Category name must be between 2-50 characters'),
  categoryController.createCategory
);

router.get('/', categoryController.getAllCategories);

router.get('/:id',
  param('id').isInt({ min: 1 }).withMessage('Category ID must be a positive integer'),
  categoryController.getCategoryById
);

router.get('/:categoryId/sub-categories',
  param('categoryId').isInt({ min: 1 }),
  categoryController.getSubCategories
);

router.post('/sub-categories',
  [
    body('name').trim().isLength({ min: 2, max: 50 }),
    body('category_id').isInt({ min: 1 })
  ],
  categoryController.createSubCategory
);

module.exports = router;
