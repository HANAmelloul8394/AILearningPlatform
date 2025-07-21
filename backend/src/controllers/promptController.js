const promptService = require('../services/promptService');

class PromptController {
  createPrompt = async (req, res) => {
    const prompt = await promptService.createPrompt(req.body);
      
      res.status(201).json({
        success: true,
      message: 'Prompt created and processed successfully',
      data: prompt
      });
  };

  getAllPrompts = async (req, res) => {
    const result = await promptService.getAllPrompts(req.query);

      res.json({
        success: true,
      data: result
      });
  };
  
  getAllPromptsWithDetails = async (req, res) => {
    const result = await promptService.getAllPromptsWithDetails(req.query);

      res.json({
        success: true,
      data: result
      });
  };

  getUserPrompts = async (req, res) => {
    const history = await promptService.getUserPrompts(req.params.userId, req.query);

      res.json({
        success: true,
      data: history
      });
  };

  deletePrompt = async (req, res) => {
    await promptService.deletePrompt(req.params.id);

      res.json({
        success: true,
        message: 'Prompt deleted successfully'
      });
  };
  
  getPromptByCategoryByName = async (req, res) => {
    const { categoryName } = req.params;
    const result = await promptService.getPromptByCategoryName(categoryName);
  
    res.json({
      success: true,
      data: result
      });
  };
  
}

module.exports = new PromptController();