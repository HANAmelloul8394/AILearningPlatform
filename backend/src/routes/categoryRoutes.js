const express = require('express');
const categoryController = require('../controllers/categoryController');
const { handleValidation } = require('../middleware/handleValidation');
const { validateCategory, validateSubCategory, validateId, validateCategoryId } = require('../middleware/categoryValidation');
const { handleAsync } = require('../middleware/asyncHandler');

const router = express.Router();

router.post('/',
    validateCategory,
    handleValidation,
    handleAsync(categoryController.createCategory));

router.get('/',
   handleAsync(categoryController.getAllCategories));

router.get('/:id',
   validateId,
   handleValidation,
   handleAsync(categoryController.getCategoryById));

router.get('/:categoryId/sub-categories',
   validateCategoryId,
   handleValidation,
   handleAsync(categoryController.getSubCategories));

router.post('/sub-categories',
   validateSubCategory,
   handleValidation,
   handleAsync(categoryController.createSubCategory));


module.exports = router;