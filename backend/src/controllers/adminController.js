const userService = require('../services/userService');
const promptService = require('../services/promptService');
const categoryService = require('../services/categoryService');
const { Parser } = require('json2csv');

class AdminController {
  
  async getDashboardStats(req, res) {
    try {
      const stats = await Promise.all([
        userService.getUserCount(),
        promptService.getPromptCount(),
        categoryService.getCategoryCount(),
        promptService.getRecentActivity(7) 
      ]);

      res.json({
        success: true,
        data: {
          totalUsers: stats[0],
          totalPrompts: stats[1],
          totalCategories: stats[2],
          recentActivity: stats[3]
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard stats',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

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

  async getAllPromptsWithDetails(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        category_id, 
        sub_category_id, 
        user_id,
        start_date,
        end_date 
      } = req.query;
      
      const prompts = await promptService.getAllPromptsWithDetails({
        page: parseInt(page),
        limit: parseInt(limit),
        filters: {
          category_id: category_id ? parseInt(category_id) : null,
          sub_category_id: sub_category_id ? parseInt(sub_category_id) : null,
          user_id: user_id ? parseInt(user_id) : null,
          start_date,
          end_date
        }
      });

      res.json({
        success: true,
        data: prompts
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch prompts with details',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async exportData(req, res) {
    try {
      const { type, format = 'json' } = req.query;
      
      let data;
      switch (type) {
        case 'users':
          data = await userService.exportUsers();
          break;
        case 'prompts':
          data = await promptService.exportPrompts();
          break;
        case 'categories':
          data = await categoryService.exportCategories();
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid export type'
          });
      }

      const filename = `${type}.${format}`;

      if (format === 'csv') {
        const parser = new Parser();
        const csv = parser.parse(data);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.send(csv);
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.json({
        success: true,
        data
      });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to export data',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new AdminController();