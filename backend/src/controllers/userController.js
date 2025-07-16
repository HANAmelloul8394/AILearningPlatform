const userService = require('../services/userService');
const { handleAsync } = require('../middleware/asyncHandler');
const { handleValidation } = require('../middleware/validation');

class UserController {
  createUser = handleAsync(async (req, res) => {
    const user = await userService.createUser(req.body);
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
  });

  getAllUsers = handleAsync(async (req, res) => {
    const result = await userService.getAllUsers(req.query);
    
    res.json({
      success: true,
      data: result
    });
  });

  getUserById = handleAsync(async (req, res) => {
    const user = await userService.getUserById(req.params.id);
    
    res.json({
      success: true,
      data: user
    });
  });

  getUserHistory = handleAsync(async (req, res) => {
    const history = await userService.getUserHistory(req.params.id, req.query);
    
    res.json({
      success: true,
      data: history
    });
  });

  getUserAnalytics = handleAsync(async (req, res) => {
    const analytics = await userService.getUserAnalytics(req.params.id);
    
    res.json({
      success: true,
      data: analytics
    });
  });
}

module.exports = new UserController();
