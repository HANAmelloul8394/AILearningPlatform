const { OpenAI } = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const { fn, col, literal, Op } = require('../../config/sequelize');
const { Prompt, User, Category, SubCategory } = require('../models');
const {
  validateUserId,
  validateCategoryId,
  validateCreatePromptData,
  validatePagination,
  validateDateRange
} = require('../utils/validationUtils');
const { ValidationError } = require('../utils/errorFactory');

class PromptService {
  async getPromptByCategoryName(categoryName) {
    if (!categoryName || typeof categoryName !== 'string') {
      throw new ValidationError('Invalid category name');
    }
  
    const category = await Category.findOne({
      where: { name: categoryName.trim() }
    });
  
    if (!category) {
      throw new ValidationError(`Category "${categoryName}" not found`);
    }
  
    const prompts = await Prompt.findAll({
      where: { category_id: category.id },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name'] },
        { model: SubCategory, as: 'subCategory', attributes: ['id', 'name'] }
      ],
      order: [['created_at', 'DESC']]
    });
  
    return {
      category_name: category.name,
      category_id: category.id,
      total: prompts.length,
      prompts: prompts.map(p => p.toJSON())
    };
  }

  async getAllPrompts(options = {}) {
    const { user_id = null, page = 1, limit = 10 } = options;
    const pagination = validatePagination({ page, limit });
    if (!pagination.isValid) throw new ValidationError(pagination.errors.join(', '));

    if (user_id && !validateUserId(user_id).isValid) {
      throw new ValidationError('Invalid user ID');
    }

    const where = user_id ? { user_id } : {};
    const { offset, limit: validLimit, page: validPage } = pagination.values;

    const { count: total, rows } = await Prompt.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name'] },
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: SubCategory, as: 'subCategory', attributes: ['id', 'name'] }
      ],
      attributes: {
        include: [
          [fn('LENGTH', col('response')), 'response_length'],
          [fn('LENGTH', col('prompt')), 'prompt_length']
        ]
      },
      order: [['created_at', 'DESC']],
      limit: validLimit,
      offset,
      distinct: true
    });

    const totalPages = Math.ceil(total / validLimit);
      return {
      prompts: rows.map(r => r.toJSON()),
        pagination: {
        page: validPage,
        limit: validLimit,
          total,
        totalPages,
        hasNextPage: validPage < totalPages,
        hasPreviousPage: validPage > 1
        }
      };
  }

  async getAllPromptsWithDetails(options = {}) {
    const { filters = {}, page = 1, limit = 10 } = options;
    const pagination = validatePagination({ page, limit });
    if (!pagination.isValid) throw new ValidationError(pagination.errors.join(', '));

    const { offset, limit: validLimit, page: validPage } = pagination.values;
    const where = {};

    if (filters.user_id) where.user_id = filters.user_id;
    if (filters.category_id) where.category_id = filters.category_id;
    if (filters.sub_category_id) where.sub_category_id = filters.sub_category_id;

    if (filters.start_date || filters.end_date) {
      const dateValidation = validateDateRange(filters.start_date, filters.end_date);
      if (!dateValidation.isValid) throw new ValidationError(dateValidation.errors.join(', '));

      where.created_at = {
        ...(filters.start_date && { [Op.gte]: filters.start_date }),
        ...(filters.end_date && { [Op.lte]: filters.end_date })
      };
      }

    const { count: total, rows } = await Prompt.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['name', 'phone', 'created_at'] },
        { model: Category, as: 'category', attributes: ['name'] },
        { model: SubCategory, as: 'subCategory', attributes: ['name'] }
      ],
      attributes: {
        include: [
          [fn('LENGTH', col('prompt')), 'prompt_length'],
          [fn('LENGTH', col('response')), 'response_length'],
          [literal('TIMESTAMPDIFF(HOUR, `Prompt`.`created_at`, NOW())'), 'hours_ago']
        ]
      },
      order: [['created_at', 'DESC']],
      limit: validLimit,
      offset
    });

    const totalPages = Math.ceil(total / validLimit);
    return {
      prompts: rows.map(r => r.toJSON()),
      pagination: {
        page: validPage,
        limit: validLimit,
        total,
        totalPages,
        hasNextPage: validPage < totalPages,
        hasPreviousPage: validPage > 1
      }
    };
  }

  async getUserPrompts(userId, options = {}) {
    const validation = validateUserId(userId);
    if (!validation.isValid) throw new ValidationError(validation.error);

    const pagination = validatePagination(options);
    if (!pagination.isValid) throw new ValidationError(pagination.errors.join(', '));

    const { offset, limit, page } = pagination.values;

    const { count: total, rows } = await Prompt.findAndCountAll({
      where: { user_id: validation.value },
      include: [
        { model: Category, as: 'category', attributes: ['name'] },
        { model: SubCategory, as: 'subCategory', attributes: ['name'] }
      ],
      
      attributes: {
        include: [
          [fn('LENGTH', col('response')), 'response_length'],
          [fn('LENGTH', col('prompt')), 'prompt_length'],
          [literal('TIMESTAMPDIFF(HOUR, Prompt.created_at, NOW())'), 'hours_ago']
        ]
      },
      order: [[col('Prompt.created_at'), 'DESC']],
      limit,
      offset
    });

    const totalPages = Math.ceil(total / limit);
      return {
      prompts: rows.map(r => r.toJSON()),
        pagination: {
        page,
        limit,
          total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
        }
      };
  }

  async deletePrompt(id) {
    const validation = validateCategoryId(id, 'prompt');
    if (!validation.isValid) throw new ValidationError(validation.error);

    const deleted = await Prompt.destroy({ where: { id: validation.value } });
    return deleted > 0;
  }

  async createPrompt(data) {
    const validation = validateCreatePromptData(data);
    if (!validation.isValid) throw new ValidationError(validation.errors.join(', '));

    const { user_id, category_id, sub_category_id, prompt } = validation.sanitizedData;

    const aiPrompt = `
      You are a professional educator. Please create a full lesson about the category ID ${category_id} and subcategory ID ${sub_category_id}.
      Include title, intro, sections, examples, summary, and 3 questions.
      The user also asked: "${prompt}"
    `;

    let aiResponseText = '';

    try {
      const aiResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful teaching assistant." },
          { role: "user", content: aiPrompt }
        ],
        temperature: 0.6,
        max_tokens: 1000
      });
      aiResponseText = aiResponse?.choices?.[0]?.message?.content || 'No content returned from AI';
    } catch (err) {
      aiResponseText = `AI Error: ${err.message}`;
    }

    const created = await Prompt.create({
      user_id,
      category_id,
      sub_category_id,
      prompt,
      response: aiResponseText
    });

    return { success: true, data: created.toJSON() };
  }

  async exportPrompts() {
    const rows = await Prompt.findAll({
      include: [
        { model: User, as: 'user', attributes: ['name', 'phone', 'created_at'] },
        { model: Category, as: 'category', attributes: ['name'] },
        { model: SubCategory, as: 'subCategory', attributes: ['name'] }
      ],
      attributes: {
        include: [
          [fn('LENGTH', col('response')), 'response_length'],
          [fn('LENGTH', col('prompt')), 'prompt_length'],
          [literal('TIMESTAMPDIFF(DAY, created_at, NOW())'), 'days_ago']
        ]
      },
      order: [['created_at', 'DESC']]
    });

    return rows.map(r => r.toJSON());
  }
}

module.exports = new PromptService();
