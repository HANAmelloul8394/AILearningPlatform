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

  deletePrompt = async (req, res) => {
    await promptService.deletePrompt(req.params.id);

      res.json({
        success: true,
        message: 'Prompt deleted successfully'
      });
  };
  
}

module.exports = new PromptController();