// backend/src/controllers/userController.js
const { pool } = require('../config/db.js');
const { validationResult } = require('express-validator');

class UserController {
  async createUser(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { name, phone } = req.body;
      
      const result = await pool.query(
        'INSERT INTO users (name, phone) VALUES ($1, $2) RETURNING *',
        [name, phone]
      );
      
      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: result.rows[0]
      });
    } catch (error) {
      if (error.code === '23505') { // PostgreSQL unique violation
        return res.status(400).json({
          success: false,
          message: 'Phone number already exists'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async getAllUsers(req, res) {
    try {
      const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
      
      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async getUserHistory(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;
      
      const result = await pool.query(`
        SELECT 
          p.*,
          c.name as category_name,
          sc.name as sub_category_name
        FROM prompts p
        JOIN categories c ON p.category_id = c.id
        JOIN sub_categories sc ON p.sub_category_id = sc.id
        WHERE p.user_id = $1
        ORDER BY p.created_at DESC
        LIMIT $2 OFFSET $3
      `, [id, limit, offset]);

      // Get total count for pagination
      const countResult = await pool.query(
        'SELECT COUNT(*) FROM prompts WHERE user_id = $1',
        [id]
      );

      res.json({
        success: true,
        data: {
          prompts: result.rows,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: parseInt(countResult.rows[0].count),
            totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user history',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new UserController();