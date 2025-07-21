const userService = require('../services/userService');

class UserController {
  createUser = async (req, res) => {
    const data = await userService.createUser(req.body);
      
      res.status(201).json({
        success: true,
        message: 'User created successfully',
      data: data
      });
  };

  getAllUsers = async (req, res) => {
    const result = await userService.getAllUsers(req.query);
    res.json({
      success: true,
      data: result
      });
  };

  getUserById = async (req, res) => {
    const user = await userService.getUserById(req.params.id);
      
      res.json({
        success: true,
      data: user
      });
  };

  getUserHistory = async (req, res) => {
    const history = await userService.getUserHistory(req.params.id, req.query);

      res.json({
        success: true,
      data: history
      });
  };

  deleteUser = async (req, res) => {
    await userService.deleteUser(req.params.id);
      res.json({
        success: true,
      message: 'User deleted successfully'
    });
  };

  getMe = async (req, res) => {
    const me = await userService.getMe(req.user);
    res.json({ success: true, user: me , token: req.token });
  };

  login = async (req, res) => {
    const result = await userService.login(req.body);
    res.json({ success: true, user: result.user, token: result.token });
  };
}

module.exports = new UserController();
