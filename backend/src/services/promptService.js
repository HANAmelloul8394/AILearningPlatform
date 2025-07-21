const { OpenAI } = require("openai");
const openai=new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
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
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful teaching assistant." },
          { role: "user", content: aiPrompt }
        ],
        temperature: 0.6,
        max_tokens: 1000
      });
      aiResponseText = aiResponse?.choices?.[0]?.message?.content || 'No content returned from AI';
    } catch (err) {
       aiResponseText = `AI Error: The OpenAI API key is invalid or missing. Please check the environment file.`;
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

}

module.exports = new PromptService();
