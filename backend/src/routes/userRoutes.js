const express = require('express');
const userController = require('../controllers/userController');
const adminController = require('../controllers/adminController');
const { handleValidation } = require('../middleware/handleValidation');
const { handleAsync } = require('../middleware/asyncHandler');
const { validateUserCreation, validateUserId } = require('../middleware/userValidators');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', validateUserCreation, handleValidation, handleAsync(userController.createUser));
router.post('/login', handleAsync(userController.login));

router.get('/', authMiddleware, authorizeRoles('admin'), handleAsync(userController.getAllUsers));
router.get('/me', authMiddleware, handleAsync(userController.getMe));

router.get('/:id', authMiddleware, validateUserId, handleValidation, handleAsync(userController.getUserById));
router.get('/:id/history', authMiddleware, validateUserId, handleValidation, handleAsync(userController.getUserHistory));
router.delete('/:id', authMiddleware,validateUserId, authorizeRoles('admin'), handleAsync(userController.deleteUser));

router.get('/admin-dashboard', authMiddleware, authorizeRoles('admin'), handleAsync(adminController.dashboard));

module.exports = router;
