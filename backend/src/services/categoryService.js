const { query } = require('../config/db');

class CategoryService {
  async getCategoryCount() {
    const result = await query('SELECT COUNT(*) as count FROM categories');
    return parseInt(result.rows[0].count);
  }

  async getCategoryAnalytics() {
    const result = await query(`
      SELECT c.id, c.name, 
             COUNT(p.id) as prompt_count,
             COUNT(DISTINCT p.user_id) as unique_users
      FROM categories c
      LEFT JOIN prompts p ON c.id = p.category_id
      GROUP BY c.id, c.name
      ORDER BY prompt_count DESC
    `);
    return result.rows;
  }

  async exportCategories() {
    const result = await query(`
      SELECT c.*, COUNT(sc.id) as sub_category_count, COUNT(p.id) as prompt_count
      FROM categories c
      LEFT JOIN sub_categories sc ON c.id = sc.category_id
      LEFT JOIN prompts p ON c.id = p.category_id
      GROUP BY c.id
      ORDER BY c.name
    `);
    return result.rows;
  }
}

module.exports = new CategoryService();
