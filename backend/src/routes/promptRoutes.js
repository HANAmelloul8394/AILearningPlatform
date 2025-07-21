const express = require('express');
const promptController = require('../controllers/promptController');
const { handleValidation } = require('../middleware/handleValidation');
const { validatePrompt, validateId } = require('../middleware/promptValidators');
const {handleAsync} = require('../middleware/asyncHandler');


const router = express.Router();

router.post('/generate', validatePrompt, handleValidation, handleAsync(promptController.createPrompt));
router.delete('/:id', validateId, handleValidation, handleAsync(promptController.deletePrompt));

module.exports = router;
