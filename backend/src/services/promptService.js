const { query } = require('../config/db');
const { 
  validateUserId, 
  validateCategoryId, 
  validatePagination, 
  validateDateRange,
  validatePromptInput 
} = require('../utils/validationUtils');

class PromptService {
  
  async getPromptCount() {
    try {
      const result = await query('SELECT COUNT(*) as count FROM prompts');
      const count = parseInt(result.rows[0].count);
      return count;
    } catch (error) {
        throw new Error('Failed to get prompt count');
    }
  }
  
  async getRecentActivity(days = 7) {
    const safeDays = parseInt(days);
    if (isNaN(safeDays) || safeDays < 1 || safeDays > 365) {
      throw new ValidationError('Days parameter must be a number between 1 and 365');
    }

    try {
      const result = await query(`
        SELECT 
          DATE(created_at) as date, 
          COUNT(*) as count,
          COUNT(DISTINCT user_id) as unique_users
        FROM prompts 
        WHERE created_at >= NOW() - INTERVAL '${safeDays} days'
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `);

      return result.rows;
    } catch (error) {
      throw new Error('Failed to fetch recent activity');
    }
  }

  async getAllPrompts(options = {}) {
    const { page = 1, limit = 10, user_id = null } = options;

    const pagination = validatePagination({ page, limit });
    if (!pagination.isValid) {
      throw new ValidationError('Invalid pagination values', pagination.errors);
    }

    if (user_id !== null) {
      const userCheck = validateUserId(user_id);
      if (!userCheck.isValid) {
        throw new ValidationError('Invalid user ID', userCheck.error);
      }
    }

    const { page: validPage, limit: validLimit, offset } = pagination.values;

    try {
      let queryText = `
        SELECT 
          p.id, p.prompt, p.response, p.created_at, p.updated_at,
          u.name as user_name, u.id as user_id,
          c.name as category_name, c.id as category_id,
          sc.name as sub_category_name, sc.id as sub_category_id,
          LENGTH(p.response) as response_length,
          LENGTH(p.prompt) as prompt_length
        FROM prompts p
        JOIN users u ON p.user_id = u.id
        JOIN categories c ON p.category_id = c.id
        JOIN sub_categories sc ON p.sub_category_id = sc.id
      `;

      const params = [];

      if (user_id !== null) {
        queryText += ` WHERE p.user_id = $1`;
        params.push(user_id);
      }

      queryText += ` ORDER BY p.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(validLimit, offset);

      const result = await query(queryText, params);

      let countQuery = 'SELECT COUNT(*) FROM prompts';
      const countParams = [];

      if (user_id !== null) {
        countQuery += ' WHERE user_id = $1';
        countParams.push(user_id);
      }

      const countResult = await query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].count);
      const totalPages = Math.ceil(total / validLimit);

      return {
        prompts: result.rows,
        pagination: {
          page: validPage,
          limit: validLimit,
          total,
          totalPages,
          hasNextPage: validPage < totalPages,
          hasPreviousPage: validPage > 1
        }
      };
    } catch (error) {
      throw new Error('Failed to fetch prompts');
    }
  }

  async getAllPromptsWithDetails(options = {}) {
    const { page = 1, limit = 10, filters = {} } = options;
    
    // Validate pagination
    const paginationValidation = validatePagination({ page, limit });
    if (!paginationValidation.isValid) {
      throw new Error(`Pagination validation failed: ${paginationValidation.errors.join(', ')}`);
    }
    
    const { page: validPage, limit: validLimit, offset } = paginationValidation.values;
    
    // Validate filters
    if (filters.user_id) {
      const userValidation = validateUserId(filters.user_id);
      if (!userValidation.isValid) {
        throw new Error(`Filter user_id validation failed: ${userValidation.error}`);
      }
    }
    
    if (filters.category_id) {
      const categoryValidation = validateCategoryId(filters.category_id, 'category');
      if (!categoryValidation.isValid) {
        throw new Error(`Filter category_id validation failed: ${categoryValidation.error}`);
      }
    }
    
    if (filters.sub_category_id) {
      const subCategoryValidation = validateCategoryId(filters.sub_category_id, 'sub-category');
      if (!subCategoryValidation.isValid) {
        throw new Error(`Filter sub_category_id validation failed: ${subCategoryValidation.error}`);
      }
    }
    
    // Validate date range if provided
    if (filters.start_date || filters.end_date) {
      const dateValidation = validateDateRange(filters.start_date, filters.end_date);
      if (!dateValidation.isValid) {
        throw new Error(`Date range validation failed: ${dateValidation.errors.join(', ')}`);
      }
    }

    try {
      let queryText = `
        SELECT 
          p.*,
          u.name as user_name, 
          u.phone as user_phone,
          u.created_at as user_joined_date,
          c.name as category_name,
          sc.name as sub_category_name,
          LENGTH(p.response) as response_length,
          LENGTH(p.prompt) as prompt_length,
          EXTRACT(EPOCH FROM (NOW() - p.created_at))/3600 as hours_ago
        FROM prompts p
        JOIN users u ON p.user_id = u.id
        JOIN categories c ON p.category_id = c.id
        JOIN sub_categories sc ON p.sub_category_id = sc.id
        WHERE 1=1
      `;
      const params = [];

      // Apply filters dynamically
      const filterMap = [
        { condition: filters.category_id, sql: 'p.category_id = $', value: filters.category_id },
        { condition: filters.sub_category_id, sql: 'p.sub_category_id = $', value: filters.sub_category_id },
        { condition: filters.user_id, sql: 'p.user_id = $', value: filters.user_id },
        { condition: filters.start_date, sql: 'p.created_at >= $', value: filters.start_date },
        { condition: filters.end_date, sql: 'p.created_at <= $', value: filters.end_date }
      ];

      filterMap.forEach(filter => {
        if (filter.condition) {
          queryText += ` AND ${filter.sql}${params.length + 1}`;
          params.push(filter.value);
        }
      });

      queryText += ` ORDER BY p.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(validLimit, offset);

      const result = await query(queryText, params);
      
      console.log(`🔍 Retrieved ${result.rows.length} detailed prompts with filters applied`);
      return result.rows;
    } catch (error) {
      console.error('❌ Error getting prompts with details:', error.message);
      throw error;
    }
  }

  /**
   * Get a specific prompt by ID
   * @param {number|string} id - Prompt ID
   * @returns {Promise<Object|null>} Prompt object or null if not found
   */
  async getPromptById(id) {
    // Validate ID
    const idValidation = validateCategoryId(id, 'prompt');
    if (!idValidation.isValid) {
      throw new Error(`Prompt ID validation failed: ${idValidation.error}`);
    }

    try {
      const result = await query(`
        SELECT 
          p.*,
          u.name as user_name,
          u.phone as user_phone,
          c.name as category_name,
          sc.name as sub_category_name,
          LENGTH(p.response) as response_length,
          LENGTH(p.prompt) as prompt_length,
          EXTRACT(EPOCH FROM (NOW() - p.created_at))/3600 as hours_ago
        FROM prompts p
        JOIN users u ON p.user_id = u.id
        JOIN categories c ON p.category_id = c.id
        JOIN sub_categories sc ON p.sub_category_id = sc.id
        WHERE p.id = $1
      `, [idValidation.value]);
      
      const prompt = result.rows.length > 0 ? result.rows[0] : null;
      
      if (prompt) {
        console.log(`✅ Found prompt ID ${id}: "${prompt.prompt.substring(0, 50)}..."`);
      } else {
        console.log(`❌ Prompt ID ${id} not found`);
      }
      
      return prompt;
    } catch (error) {
      console.error('❌ Error getting prompt by id:', error.message);
      throw error;
    }
  }

  /**
   * Get prompts for a specific user
   * @param {number|string} userId - User ID
   * @param {Object} options - Query options {page, limit}
   * @returns {Promise<Object>} Paginated user prompts
   */
  async getUserPrompts(userId, options = {}) {
    // Validate user ID
    const userValidation = validateUserId(userId);
    if (!userValidation.isValid) {
      throw new Error(`User ID validation failed: ${userValidation.error}`);
    }
    
    // Validate pagination
    const { page = 1, limit = 10 } = options;
    const paginationValidation = validatePagination({ page, limit });
    if (!paginationValidation.isValid) {
      throw new Error(`Pagination validation failed: ${paginationValidation.errors.join(', ')}`);
    }
    
    const { page: validPage, limit: validLimit, offset } = paginationValidation.values;

    try {
      const result = await query(`
        SELECT 
          p.*,
          c.name as category_name,
          sc.name as sub_category_name,
          LENGTH(p.response) as response_length,
          LENGTH(p.prompt) as prompt_length,
          EXTRACT(EPOCH FROM (NOW() - p.created_at))/3600 as hours_ago
        FROM prompts p
        JOIN categories c ON p.category_id = c.id
        JOIN sub_categories sc ON p.sub_category_id = sc.id
        WHERE p.user_id = $1
        ORDER BY p.created_at DESC
        LIMIT $2 OFFSET $3
      `, [userValidation.value, validLimit, offset]);

      const countResult = await query('SELECT COUNT(*) FROM prompts WHERE user_id = $1', [userValidation.value]);
      const total = parseInt(countResult.rows[0].count);
      const totalPages = Math.ceil(total / validLimit);

      console.log(`👤 Retrieved ${result.rows.length} prompts for user ${userId} (page ${validPage}/${totalPages})`);

      return {
        prompts: result.rows,
        pagination: {
          page: validPage,
          limit: validLimit,
          total,
          totalPages,
          hasNextPage: validPage < totalPages,
          hasPreviousPage: validPage > 1
        }
      };
    } catch (error) {
      console.error('❌ Error getting user prompts:', error.message);
      throw error;
    }
  }

  /**
   * Delete a prompt by ID
   * @param {number|string} id - Prompt ID to delete
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async deletePrompt(id) {
    // Validate ID
    const idValidation = validateCategoryId(id, 'prompt');
    if (!idValidation.isValid) {
      throw new Error(`Prompt ID validation failed: ${idValidation.error}`);
    }

    try {
      const result = await query('DELETE FROM prompts WHERE id = $1 RETURNING id, prompt', [idValidation.value]);
      const deleted = result.rows.length > 0;
      
      if (deleted) {
        const deletedPrompt = result.rows[0];
        console.log(`🗑️ Deleted prompt ID ${id}: "${deletedPrompt.prompt.substring(0, 50)}..."`);
      } else {
        console.log(`❌ Prompt ID ${id} not found for deletion`);
      }
      
      return deleted;
    } catch (error) {
      console.error('❌ Error deleting prompt:', error.message);
      throw error;
    }
  }

  /**
   * Export all prompts with full details
   * @returns {Promise<Array>} Array of all prompts with complete information
   */
  async exportPrompts() {
    try {
      const result = await query(`
        SELECT 
          p.id,
          p.prompt,
          p.response,
          p.created_at,
          p.updated_at,
          u.name as user_name,
          u.phone as user_phone,
          u.created_at as user_joined_date,
          c.name as category_name,
          sc.name as sub_category_name,
          LENGTH(p.response) as response_length,
          LENGTH(p.prompt) as prompt_length,
          EXTRACT(EPOCH FROM (NOW() - p.created_at))/86400 as days_ago
        FROM prompts p
        JOIN users u ON p.user_id = u.id
        JOIN categories c ON p.category_id = c.id
        JOIN sub_categories sc ON p.sub_category_id = sc.id
        ORDER BY p.created_at DESC
      `);
      
      console.log(`📦 Exported ${result.rows.length} prompts for download`);
      return result.rows;
    } catch (error) {
      console.error('❌ Error exporting prompts:', error.message);
      throw error;
    }
  }

  /**
   * Get prompt statistics and analytics
   * @returns {Promise<Object>} Comprehensive prompt statistics
   */
  async getPromptAnalytics() {
    try {
      const [
        totalCount,
        avgResponseLength,
        topCategories,
        dailyStats
      ] = await Promise.all([
        // Total prompts
        query('SELECT COUNT(*) as total FROM prompts'),
        
        // Average response length
        query('SELECT AVG(LENGTH(response)) as avg_length FROM prompts WHERE response IS NOT NULL'),
        
        // Top categories
        query(`
          SELECT 
            c.name as category_name,
            COUNT(p.id) as prompt_count,
            AVG(LENGTH(p.response)) as avg_response_length
          FROM prompts p
          JOIN categories c ON p.category_id = c.id
          GROUP BY c.id, c.name
          ORDER BY prompt_count DESC
          LIMIT 10
        `),
        
        // Daily statistics for last 30 days
        query(`
          SELECT 
            DATE(created_at) as date,
            COUNT(*) as daily_count,
            COUNT(DISTINCT user_id) as unique_users,
            AVG(LENGTH(prompt)) as avg_prompt_length
          FROM prompts
          WHERE created_at >= NOW() - INTERVAL '30 days'
          GROUP BY DATE(created_at)
          ORDER BY date DESC
        `)
      ]);

      const analytics = {
        total_prompts: parseInt(totalCount.rows[0].total),
        average_response_length: Math.round(parseFloat(avgResponseLength.rows[0].avg_length) || 0),
        top_categories: topCategories.rows,
        daily_statistics: dailyStats.rows
      };

      console.log(`📊 Generated analytics for ${analytics.total_prompts} total prompts`);
      return analytics;
    } catch (error) {
      console.error('❌ Error generating prompt analytics:', error.message);
      throw error;
    }
  }
}

module.exports = new PromptService();