const express = require('express');
const adminController = require('../controllers/adminController');
const {handleValidation} = require('../middleware/handleValidation');
const { handleAsync } = require('../middleware/asyncHandler');

const router = express.Router();

router.get('/dashboard',
  handleAsync(adminController.getDashboardStats)
);

router.get('/users',
  handleValidation,
  handleAsync(adminController.getAllUsersWithHistory)
);

router.get('/prompts',
  handleValidation,
  handleAsync(adminController.getAllPromptsWithDetails)
);

router.get('/export',
  handleValidation,
  handleAsync(adminController.exportData)
);

module.exports = router;
