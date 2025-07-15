// backend/src/services/aiService.js
const axios = require('axios');

const generateResponse = async (prompt, categoryName = '', subCategoryName = '') => {
  try {
    // Create a more educational prompt
    const educationalPrompt = `You are an expert educator${categoryName && subCategoryName ? ` specializing in ${categoryName} - ${subCategoryName}` : ''}. 
Create a comprehensive, engaging lesson for: ${prompt}

Structure your response with:
1. Clear explanation of key concepts
2. Practical examples
3. Real-world applications
4. Summary of main points

Keep the tone educational but engaging.`;

    const res = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful educational assistant that creates structured, engaging lessons.'
        },
        {
          role: 'user', 
          content: educationalPrompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return res.data.choices[0].message.content;
  } catch (error) {
    console.error('AI Service Error:', error.response?.data || error.message);
    
    // Fallback response if API fails
    return `# Lesson: ${prompt}

## Topic Overview
This lesson covers the key concepts related to your query: "${prompt}"

### Main Points:
1. **Introduction**: Understanding the basics
2. **Key Concepts**: Core principles to remember
3. **Applications**: How to use this knowledge
4. **Practice**: Ways to reinforce learning

### Summary:
Continue exploring this topic through practice and further questions.

*Note: This is a simplified response. For more detailed lessons, please ensure the AI service is properly configured.*`;
  }
};

module.exports = {
  generateResponse
};