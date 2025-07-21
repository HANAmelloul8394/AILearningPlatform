const express = require('express');
const adminController = require('../controllers/adminController');
const {handleValidation} = require('../middleware/handleValidation');
const { handleAsync } = require('../middleware/asyncHandler');

const router = express.Router();

router.get('/users',
  handleValidation,
  handleAsync(adminController.getAllUsersWithHistory)
);


module.exports = router;
