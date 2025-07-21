const userService = require('../services/userService');
class AdminController {

  async getAllUsersWithHistory(req, res) {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;
      const users = await userService.getAllUsersWithHistory({
        page: parseInt(page),
        limit: parseInt(limit),
        search
      });

      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users with history',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

};

module.exports = new AdminController();