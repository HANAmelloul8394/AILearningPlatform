// backend/src/controllers/categoryController.js
const { pool } = require('../config/db.js');
const { validationResult } = require('express-validator');

class CategoryController {
  async createCategory(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { name } = req.body;
      const result = await pool.query(
        'INSERT INTO categories (name) VALUES ($1) RETURNING *',
        [name]
      );
      
      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: result.rows[0]
      });
    } catch (error) {
      if (error.code === '23505') {
        return res.status(400).json({
          success: false,
          message: 'Category already exists'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async getAllCategories(req, res) {
    try {
      const result = await pool.query('SELECT * FROM categories ORDER BY name');
      
      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch categories',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async getCategoryById(req, res) {
    try {
      const { id } = req.params;
      const result = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch category',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async createSubCategory(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { name, category_id } = req.body;
      const result = await pool.query(
        'INSERT INTO sub_categories (name, category_id) VALUES ($1, $2) RETURNING *',
        [name, category_id]
      );
      
      res.status(201).json({
        success: true,
        message: 'Sub-category created successfully',
        data: result.rows[0]
      });
    } catch (error) {
      if (error.code === '23503') {
        return res.status(400).json({
          success: false,
          message: 'Category does not exist'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async getSubCategories(req, res) {
    try {
      const { categoryId } = req.params;
      const result = await pool.query(
        'SELECT * FROM sub_categories WHERE category_id = $1 ORDER BY name',
        [categoryId]
      );
      
      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch sub-categories',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new CategoryController();