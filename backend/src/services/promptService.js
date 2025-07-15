const { query } = require('../config/db');

class PromptService {
  async getPromptCount() {
    try {
      const result = await query('SELECT COUNT(*) as count FROM prompts');
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Error getting prompt count:', error);
      return 0;
    }
  }

  async getRecentActivity(days = 7) {
    try {
      const result = await query(`
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM prompts 
        WHERE created_at >= NOW() - INTERVAL '${days} days'
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `);
      return result.rows;
    } catch (error) {
      console.error('Error getting recent activity:', error);
      return [];
    }
  }

  async getAllPrompts(options = {}) {
    const { page = 1, limit = 10, user_id = null } = options;
    const offset = (page - 1) * limit;

    try {
      let queryText = `
        SELECT p.*, u.name as user_name, c.name as category_name, sc.name as sub_category_name
        FROM prompts p
        JOIN users u ON p.user_id = u.id
        JOIN categories c ON p.category_id = c.id
        JOIN sub_categories sc ON p.sub_category_id = sc.id
      `;
      const params = [];

      if (user_id) {
        queryText += ` WHERE p.user_id = $1`;
        params.push(user_id);
      }

      queryText += ` ORDER BY p.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);

      const result = await query(queryText, params);
      
      // Get total count
      let countQuery = 'SELECT COUNT(*) FROM prompts';
      const countParams = [];
      if (user_id) {
        countQuery += ' WHERE user_id = $1';
        countParams.push(user_id);
      }
      
      const countResult = await query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].count);

      return {
        prompts: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting prompts:', error);
      throw error;
    }
  }

  async getAllPromptsWithDetails(options = {}) {
    const { page = 1, limit = 10, filters = {} } = options;
    const offset = (page - 1) * limit;

    try {
      let queryText = `
        SELECT p.*, u.name as user_name, u.phone as user_phone,
               c.name as category_name, sc.name as sub_category_name
        FROM prompts p
        JOIN users u ON p.user_id = u.id
        JOIN categories c ON p.category_id = c.id
        JOIN sub_categories sc ON p.sub_category_id = sc.id
        WHERE 1=1
      `;
      const params = [];

      if (filters.category_id) {
        queryText += ` AND p.category_id = $${params.length + 1}`;
        params.push(filters.category_id);
      }
      if (filters.sub_category_id) {
        queryText += ` AND p.sub_category_id = $${params.length + 1}`;
        params.push(filters.sub_category_id);
      }
      if (filters.user_id) {
        queryText += ` AND p.user_id = $${params.length + 1}`;
        params.push(filters.user_id);
      }
      if (filters.start_date) {
        queryText += ` AND p.created_at >= $${params.length + 1}`;
        params.push(filters.start_date);
      }
      if (filters.end_date) {
        queryText += ` AND p.created_at <= $${params.length + 1}`;
        params.push(filters.end_date);
      }

      queryText += ` ORDER BY p.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);

      const result = await query(queryText, params);
      return result.rows;
    } catch (error) {
      console.error('Error getting prompts with details:', error);
      throw error;
    }
  }

  async getPromptById(id) {
    try {
      const result = await query(`
        SELECT p.*, u.name as user_name, c.name as category_name, sc.name as sub_category_name
        FROM prompts p
        JOIN users u ON p.user_id = u.id
        JOIN categories c ON p.category_id = c.id
        JOIN sub_categories sc ON p.sub_category_id = sc.id
        WHERE p.id = $1
      `, [id]);
      
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error getting prompt by id:', error);
      throw error;
    }
  }

  async getUserPrompts(userId, options = {}) {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    try {
      const result = await query(`
        SELECT p.*, c.name as category_name, sc.name as sub_category_name
        FROM prompts p
        JOIN categories c ON p.category_id = c.id
        JOIN sub_categories sc ON p.sub_category_id = sc.id
        WHERE p.user_id = $1
        ORDER BY p.created_at DESC
        LIMIT $2 OFFSET $3
      `, [userId, limit, offset]);

      const countResult = await query('SELECT COUNT(*) FROM prompts WHERE user_id = $1', [userId]);
      const total = parseInt(countResult.rows[0].count);

      return {
        prompts: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting user prompts:', error);
      throw error;
    }
  }

  async deletePrompt(id) {
    try {
      const result = await query('DELETE FROM prompts WHERE id = $1 RETURNING id', [id]);
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error deleting prompt:', error);
      throw error;
    }
  }

  async exportPrompts() {
    try {
      const result = await query(`
        SELECT p.*, u.name as user_name, u.phone as user_phone,
               c.name as category_name, sc.name as sub_category_name
        FROM prompts p
        JOIN users u ON p.user_id = u.id
        JOIN categories c ON p.category_id = c.id
        JOIN sub_categories sc ON p.sub_category_id = sc.id
        ORDER BY p.created_at DESC
      `);
      return result.rows;
    } catch (error) {
      console.error('Error exporting prompts:', error);
      throw error;
    }
  }
}

module.exports = new PromptService();