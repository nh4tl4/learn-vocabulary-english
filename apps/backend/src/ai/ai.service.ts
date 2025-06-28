import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AIService {
  private geminiApiKey: string;

  constructor(private configService: ConfigService) {
    // Gemini setup (primary and only AI provider)
    this.geminiApiKey = this.configService.get<string>('GEMINI_API_KEY') || 'AIzaSyBkeiHmTNwA0DEBVL4CJ6EYM1aTvDPoPVI';
    console.log('Gemini API Key available:', !!this.geminiApiKey);
  }

  // Add missing isAIAvailable method
  isAIAvailable(): boolean {
    return !!this.geminiApiKey;
  }

  // Check available AI providers
  getAvailableProviders(): string[] {
    const providers = [];
    if (this.geminiApiKey) providers.push('gemini');
    providers.push('fallback');
    return providers;
  }

  // Main chat function - tries Gemini first, then fallback
  async chatWithAI(userMessage: string, conversationHistory: Array<{role: string, content: string}> = []): Promise<string> {
    try {
      // Try Gemini first if available
      if (this.geminiApiKey) {
        return await this.chatWithGemini(userMessage, conversationHistory);
      }
    } catch (error) {
      console.error('Gemini failed, using fallback:', error.message);
    }

    // Always fallback to smart responses
    return this.getFallbackResponse(userMessage);
  }

  // Google Gemini Chat (PRIMARY - FREE)
  private async chatWithGemini(userMessage: string, conversationHistory: Array<{role: string, content: string}>): Promise<string> {
    if (!this.geminiApiKey) throw new Error('Gemini not available');

    try {
      // Build conversation context
      const systemPrompt = `You are a friendly and patient English teacher helping Vietnamese students practice English. 
      - Reply in simple, easy-to-understand English
      - Gently correct grammar mistakes
      - Encourage students to continue practicing
      - If students speak Vietnamese, encourage them to try English
      - Keep conversations interesting and educational
      - Keep responses concise (under 100 words)`;

      // Format conversation history for Gemini
      const conversationText = conversationHistory.slice(-4).map(msg =>
        `${msg.role === 'user' ? 'Student' : 'Teacher'}: ${msg.content}`
      ).join('\n');

      const fullPrompt = `${systemPrompt}

Previous conversation:
${conversationText}

Student: ${userMessage}
Teacher:`;

      // Use the new gemini-1.5-flash model instead of deprecated gemini-pro
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: fullPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 150,
            topP: 0.8,
            topK: 40,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!aiResponse) {
        throw new Error('No response from Gemini');
      }

      return aiResponse.trim();
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw error;
    }
  }

  // Generate example sentences using Gemini
  async generateExampleSentences(word: string, meaning: string): Promise<string[]> {
    if (this.geminiApiKey) {
      try {
        const prompt = `Create 2 simple example sentences in English using the word "${word}" (meaning: ${meaning}). 
        Format each sentence like this:
        1. [English sentence] - [Vietnamese translation]
        2. [English sentence] - [Vietnamese translation]
        
        Make them suitable for Vietnamese English learners at beginner to intermediate level.`;

        // Use the new gemini-1.5-flash model
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 200,
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const sentences = content.split('\n').filter(line => line.trim().length > 0).slice(0, 2);
          if (sentences.length > 0) {
            return sentences;
          }
        }
      } catch (error) {
        console.error('Gemini sentences error:', error);
      }
    }

    // Enhanced fallback with Vietnamese translations
    const fallbackExamples = {
      'book': [
        "I love reading a good book every night. - Tôi thích đọc một cuốn sách hay mỗi tối.",
        "She bought a new book at the bookstore. - Cô ấy đã mua một cuốn sách mới ở hiệu sách."
      ],
      'house': [
        "My house has a beautiful garden. - Ngôi nhà của tôi có một khu vườn đẹp.",
        "They built a new house last year. - Họ đã xây một ngôi nhà mới năm ngo��i."
      ],
      'car': [
        "His car is very fast and comfortable. - Chiếc xe của anh ấy rất nhanh và thoải mái.",
        "I need to wash my car this weekend. - Tôi cần rửa xe vào cuối tuần này."
      ],
      'water': [
        "Please drink more water every day. - Hãy uống nhiều nước hơn mỗi ngày.",
        "The water in this lake is very clean. - Nước trong hồ này rất sạch."
      ],
      'food': [
        "This food tastes delicious and healthy. - Thức ăn này có vị ngon và tốt cho sức khỏe.",
        "We need to buy more food for dinner. - Chúng ta cần mua thêm thức ăn cho bữa tối."
      ]
    };

    if (fallbackExamples[word.toLowerCase()]) {
      return fallbackExamples[word.toLowerCase()];
    }

    // Generic fallback with Vietnamese translations
    return [
      `I use the word "${word}" in daily conversation. - Tôi sử dụng từ "${word}" trong cuộc trò chuyện hàng ngày.`,
      `Learning "${word}" helps improve my English vocabulary. - Học từ "${word}" giúp cải thiện vốn từ vựng tiếng Anh của tôi.`
    ];
  }

  // Smart fallback responses (always works)
  private getFallbackResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! I'm your English practice partner. How are you today? Tell me about yourself in English!";
    } else if (lowerMessage.includes('how are you')) {
      return "I'm doing well, thank you for asking! How about you? Can you tell me what you did today?";
    } else if (lowerMessage.includes('help')) {
      return "I'm here to help you practice English! You can ask me about grammar, vocabulary, or just have a conversation. What would you like to practice?";
    } else if (lowerMessage.includes('goodbye') || lowerMessage.includes('bye')) {
      return "Goodbye! Keep practicing your English every day. You're doing great!";
    } else if (lowerMessage.includes('thank')) {
      return "You're welcome! I'm happy to help you learn English. What else would you like to practice?";
    } else if (lowerMessage.includes('weather')) {
      return "That's a great topic! Can you describe today's weather in English? Use words like sunny, cloudy, rainy, or windy.";
    } else if (lowerMessage.includes('food')) {
      return "Food is a wonderful topic for English practice! What's your favorite food? Can you describe how it tastes?";
    } else if (lowerMessage.includes('school') || lowerMessage.includes('work')) {
      return "Tell me more about that! Can you describe your daily routine in English? What do you usually do?";
    } else {
      const responses = [
        "That's interesting! Can you tell me more about that in English? I'm here to help you practice.",
        "Great! Can you explain that in more detail? Practice makes perfect!",
        "I'd love to hear more about that. Can you describe it using different English words?",
        "That's a good topic for practice! Can you ask me a question about it in English?",
        "Nice! Can you tell me your opinion about that? Remember to use complete sentences."
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }

  // Assess difficulty level of a word using Gemini
  async assessWordDifficulty(word: string, meaning: string): Promise<'beginner' | 'intermediate' | 'advanced'> {
    if (this.geminiApiKey) {
      try {
        const prompt = `Assess the difficulty level of the English word "${word}" (meaning: ${meaning}) for Vietnamese English learners. Reply with only one word: beginner, intermediate, or advanced.`;

        // Use the new gemini-1.5-flash model
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 10,
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const level = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toLowerCase();
          if (['beginner', 'intermediate', 'advanced'].includes(level)) {
            return level as 'beginner' | 'intermediate' | 'advanced';
          }
        }
      } catch (error) {
        console.error('Gemini difficulty assessment error:', error);
      }
    }

    return 'intermediate'; // Default fallback
  }

  // Generate pronunciation tip using Gemini
  async generatePronunciationTip(word: string): Promise<string> {
    if (this.geminiApiKey) {
      try {
        const prompt = `Create a pronunciation tip in Vietnamese for the English word "${word}". Help Vietnamese speakers pronounce it correctly. Give short and easy-to-understand advice.`;

        // Use the new gemini-1.5-flash model
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 150,
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const tip = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (tip) {
            return tip.trim();
          }
        }
      } catch (error) {
        console.error('Gemini pronunciation tip error:', error);
      }
    }

    return `Luyện tập phát âm từ "${word}" thường xuyên.`;
  }

  // Generate personalized learning suggestions using Gemini
  async generateLearningPath(userLevel: string, weakAreas: string[], interests: string[]): Promise<string[]> {
    if (this.geminiApiKey) {
      try {
        const prompt = `Create 5 personalized learning suggestions in Vietnamese for an English student:
        - Level: ${userLevel}
        - Weak areas: ${weakAreas.join(', ')}
        - Interests: ${interests.join(', ')}
        
        Give practical and achievable suggestions. Format as a numbered list.`;

        // Use the new gemini-1.5-flash model
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.8,
              maxOutputTokens: 400,
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const suggestions = content.split('\n').filter(line => line.trim().length > 0).slice(0, 5);
          if (suggestions.length > 0) {
            return suggestions;
          }
        }
      } catch (error) {
        console.error('Gemini learning path error:', error);
      }
    }

    return [
      'Học 10 từ vựng mới mỗi ngày',
      'Luyện tập phát âm 15 phút/ngày',
      'Đọc tin tức tiếng Anh đơn giản',
      'Xem phim tiếng Anh có phụ đề',
      'Thực hành speaking với AI chat bot'
    ];
  }
}
