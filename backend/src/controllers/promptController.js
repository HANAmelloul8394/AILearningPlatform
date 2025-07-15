// backend/src/controllers/promptController.js
const { pool } = require('../config/db.js');
const { validationResult } = require('express-validator');
const OpenAI = require('openai');
const promptService = require('../services/promptService');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class PromptController {
  async createPrompt(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { user_id, category_id, sub_category_id, prompt } = req.body;
      
      const categoryResult = await pool.query('SELECT name FROM categories WHERE id = $1', [category_id]);
      const subCategoryResult = await pool.query('SELECT name FROM sub_categories WHERE id = $1', [sub_category_id]);

      if (categoryResult.rows.length === 0 || subCategoryResult.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category or sub-category'
        });
      }

      const categoryName = categoryResult.rows[0].name;
      const subCategoryName = subCategoryResult.rows[0].name;

      let aiResponse;
      try {
        const systemPrompt = `You are an expert educator specializing in ${categoryName} - ${subCategoryName}. 
        Create a comprehensive, engaging lesson that:
        1. Explains concepts clearly and progressively
        2. Uses examples and analogies when helpful
        3. Includes practical applications
        4. Is structured with clear sections
        5. Maintains an encouraging, educational tone
        
        Topic area: ${categoryName} → ${subCategoryName}`;

        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
          ],
          max_tokens: 1500,
          temperature: 0.7,
        });

        aiResponse = completion.choices[0].message.content;
      } catch (aiError) {
        console.error('AI Error:', aiError);
        aiResponse = `# Lesson: ${prompt}

## Topic: ${categoryName} - ${subCategoryName}

This is a generated lesson response for your query: "${prompt}"

### Introduction
Thank you for your interest in learning about this topic. This lesson will help you understand the key concepts and practical applications.

### Key Points
1. **Foundation**: Understanding the basic principles
2. **Application**: How to apply these concepts in real situations
3. **Examples**: Practical examples to illustrate the concepts
4. **Practice**: Ways to reinforce your learning

### Summary
This lesson covered the fundamental aspects of your topic. Continue exploring and practicing to deepen your understanding.

*Note: This is a simplified lesson. The AI service may be temporarily unavailable.*`;
      }

      // Save to database
      const result = await pool.query(
        'INSERT INTO prompts (user_id, category_id, sub_category_id, prompt, response) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [user_id, category_id, sub_category_id, prompt, aiResponse]
      );
      
      res.status(201).json({
        success: true,
        message: 'Lesson generated successfully',
        data: result.rows[0]
      });
    } catch (error) {
      if (error.code === '23503') {
        return res.status(400).json({
          success: false,
          message: 'Invalid user, category, or sub-category ID'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to generate lesson',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async getAllPrompts(req, res) {
    try {
        const { page = 1, limit = 10, user_id } = req.query;
        const promptService = require('../services/promptService');
        const prompts = await promptService.getAllPrompts({
        page: parseInt(page),
        limit: parseInt(limit),
        user_id: user_id ? parseInt(user_id) : null
      });

      res.json({
        success: true,
        data: prompts
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch prompts',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async getPromptById(req, res) {
    try {
      const { id } = req.params;
      const prompt = await promptService.getPromptById(id);
      
      if (!prompt) {
        return res.status(404).json({
          success: false,
          message: 'Prompt not found'
        });
      }

      res.json({
        success: true,
        data: prompt
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch prompt',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async getUserPrompts(req, res) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 10 } = req.query;
      
      const prompts = await promptService.getUserPrompts(userId, {
        page: parseInt(page),
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: prompts
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user prompts',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async deletePrompt(req, res) {
    try {
      const { id } = req.params;
      const deleted = await promptService.deletePrompt(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Prompt not found'
        });
      }

      res.json({
        success: true,
        message: 'Prompt deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete prompt',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new PromptController();