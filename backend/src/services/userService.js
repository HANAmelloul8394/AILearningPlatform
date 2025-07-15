const { query } = require('../config/db');

class UserService {
  async getUserCount() {
    try {
      const result = await query('SELECT COUNT(*) as count FROM users');
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Error getting user count:', error);
      return 0;
    }
  }

  async getAllUsersWithHistory(options = {}) {
    const { page = 1, limit = 10, search = '' } = options;
    const offset = (page - 1) * limit;

    try {
      let queryText = `
        SELECT u.*, COUNT(p.id) as prompt_count
        FROM users u
        LEFT JOIN prompts p ON u.id = p.user_id
      `;
      const params = [];

      if (search) {
        queryText += ` WHERE u.name ILIKE $1 OR u.phone ILIKE $1`;
        params.push(`%${search}%`);
      }

      queryText += ` GROUP BY u.id ORDER BY u.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);

      const result = await query(queryText, params);
      
      // Get total count
      let countQuery = 'SELECT COUNT(*) FROM users';
      const countParams = [];
      if (search) {
        countQuery += ' WHERE name ILIKE $1 OR phone ILIKE $1';
        countParams.push(`%${search}%`);
      }
      
      const countResult = await query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].count);

      return {
        users: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting users with history:', error);
      throw error;
    }
  }

  async getUserAnalytics(userId) {
    try {
      const [promptCount, categoryCount, recentActivity] = await Promise.all([
        query('SELECT COUNT(*) as count FROM prompts WHERE user_id = $1', [userId]),
        query('SELECT COUNT(DISTINCT category_id) as count FROM prompts WHERE user_id = $1', [userId]),
        query(`
          SELECT DATE(created_at) as date, COUNT(*) as count 
          FROM prompts 
          WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '30 days'
          GROUP BY DATE(created_at) 
          ORDER BY date DESC
        `, [userId])
      ]);

      return {
        totalPrompts: parseInt(promptCount.rows[0].count),
        categoriesUsed: parseInt(categoryCount.rows[0].count),
        recentActivity: recentActivity.rows,
        avgPromptsPerDay: recentActivity.rows.length > 0 
          ? (parseInt(promptCount.rows[0].count) / 30).toFixed(1) 
          : 0
      };
    } catch (error) {
      console.error('Error getting user analytics:', error);
      throw error;
    }
  }

  async exportUsers() {
    try {
      const result = await query(`
        SELECT u.*, COUNT(p.id) as prompt_count
        FROM users u
        LEFT JOIN prompts p ON u.id = p.user_id
        GROUP BY u.id
        ORDER BY u.created_at DESC
      `);
      return result.rows;
    } catch (error) {
      console.error('Error exporting users:', error);
      throw error;
    }
  }
}

module.exports = new UserService();