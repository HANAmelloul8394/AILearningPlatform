// services/userService.js
const { query } = require('../config/db');
const { ValidationError, NotFoundError } = require('../utils/errorFactory');
const { validateUserId } = require('../utils/validationUtils');

class UserService {
  async createUser(userData) {
    const { name, phone } = userData;
    
    try {
      const result = await query(
        'INSERT INTO users (name, phone) VALUES (?, ?) RETURNING *',
        [name, phone]
      );
      return result[0];
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ValidationError('Phone number already exists');
      }
      throw error;
    }
  }

  async getAllUsers(options = {}) {
    const { page = 1, limit = 10, search = '' } = options;

    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      throw new ValidationError('Invalid pagination values');
    }

    const offset = (page - 1) * limit;
    let queryText = `
      SELECT u.*, COUNT(p.id) as prompt_count
      FROM users u
      LEFT JOIN prompts p ON u.id = p.user_id
    `;
    const params = [];

    if (search) {
      queryText += ` WHERE u.name LIKE ? OR u.phone LIKE ?`;
      params.push(`%${search}%`, `%${search}%`);
    }

    queryText += ` GROUP BY u.id ORDER BY u.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [users, totalResult] = await Promise.all([
      query(queryText, params),
      this.getUserCount(search)
    ]);

    return {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalResult,
        totalPages: Math.ceil(totalResult / limit)
      }
    };
  }

  async getUserById(userId) {
    const idError = validateUserId(userId);
    if (idError) throw new ValidationError(idError);

    const result = await query('SELECT * FROM users WHERE id = ?', [userId]);
    
    if (result.length === 0) {
      throw new NotFoundError('User not found');
    }
    
    return result[0];
  }

  async getUserHistory(userId, options = {}) {
    const idError = validateUserId(userId);
    if (idError) throw new ValidationError(idError);

    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    const [prompts, total] = await Promise.all([
      query(`
        SELECT
          p.*,
          c.name as category_name,
          sc.name as sub_category_name
        FROM prompts p
        JOIN categories c ON p.category_id = c.id
        LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id
        WHERE p.user_id = ?
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?
      `, [userId, limit, offset]),
      
      query('SELECT COUNT(*) as count FROM prompts WHERE user_id = ?', [userId])
    ]);

    return {
      prompts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total[0].count,
        totalPages: Math.ceil(total[0].count / limit)
      }
    };
  }

  async getUserCount(search = '') {
    let queryText = 'SELECT COUNT(*) as count FROM users';
    const params = [];

    if (search) {
      queryText += ' WHERE name LIKE ? OR phone LIKE ?';
      params.push(`%${search}%`, `%${search}%`);
    }

    const result = await query(queryText, params);
    return result[0].count;
  }

  async getUserAnalytics(userId) {
    const idError = validateUserId(userId);
    if (idError) throw new ValidationError(idError);

    const [promptCount, categoryCount, recentActivity] = await Promise.all([
      query('SELECT COUNT(*) as count FROM prompts WHERE user_id = ?', [userId]),
      query('SELECT COUNT(DISTINCT category_id) as count FROM prompts WHERE user_id = ?', [userId]),
      query(`
        SELECT DATE(created_at) as date, COUNT(*) as count 
        FROM prompts 
        WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY DATE(created_at) 
        ORDER BY date DESC
      `, [userId])
    ]);

    return {
      totalPrompts: promptCount[0].count,
      categoriesUsed: categoryCount[0].count,
      recentActivity: recentActivity,
      avgPromptsPerDay: recentActivity.length > 0 
        ? (promptCount[0].count / 30).toFixed(1) 
        : 0
    };
  }
}

module.exports = new UserService();

