const express = require('express');
const { body, param, query } = require('express-validator');
const promptController = require('../controllers/promptController');

const router = express.Router();

const validatePrompt = [
  body('user_id').isInt({ min: 1 }),
  body('category_id').isInt({ min: 1 }),
  body('sub_category_id').isInt({ min: 1 }),
  body('prompt').trim().isLength({ min: 10, max: 1000 })
];

const validateId = [
  param('id').isInt({ min: 1 })
];

const validatePagination = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
];

router.post('/', validatePrompt, promptController.createPrompt);
router.get('/', validatePagination, promptController.getAllPrompts);
router.get('/:id', validateId, promptController.getPromptById);
router.delete('/:id', validateId, promptController.deletePrompt);

router.get('/user/:userId',
  [param('userId').isInt({ min: 1 }), ...validatePagination],
  promptController.getUserPrompts
);

module.exports = router;
