import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class AIService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({
        apiKey: apiKey,
      });
    }
  }

  // Generate example sentences for vocabulary
  async generateExampleSentences(word: string, meaning: string): Promise<string[]> {
    if (!this.openai) {
      return [`Example sentence for ${word}`]; // Fallback
    }

    try {
      const prompt = `Tạo 3 câu ví dụ đơn giản và dễ hiểu bằng tiếng Anh cho từ "${word}" có nghĩa là "${meaning}". Các câu nên phù hợp với người học tiếng Anh cơ bản đến trung cấp.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an English teacher helping Vietnamese students learn English vocabulary. Generate simple, clear example sentences.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content || '';
      return content.split('\n').filter(line => line.trim().length > 0).slice(0, 3);
    } catch (error) {
      console.error('AI Error generating sentences:', error);
      return [`Example: The ${word} is very important.`];
    }
  }

  // AI Chat Bot for practice
  async chatWithAI(userMessage: string, conversationHistory: Array<{role: string, content: string}>): Promise<string> {
    if (!this.openai) {
      return "Xin lỗi, tính năng AI chat hiện tại không khả dụng.";
    }

    try {
      // Filter and type cast conversation history to match OpenAI API requirements
      const validHistory = conversationHistory.slice(-5).map(msg => ({
        role: (msg.role === 'user' || msg.role === 'assistant' || msg.role === 'system')
          ? msg.role as 'user' | 'assistant' | 'system'
          : 'user' as const,
        content: msg.content
      }));

      const messages = [
        {
          role: 'system' as const,
          content: `Bạn là một giáo viên tiếng Anh thân thiện và kiên nhẫn, giúp học sinh Việt Nam luyện tập tiếng Anh. 
          - Trả lời bằng tiếng Anh đơn giản, dễ hiểu
          - Sửa lỗi ngữ pháp một cách nhẹ nhàng
          - Khuyến khích học sinh tiếp tục thực hành
          - Nếu học sinh nói tiếng Việt, hãy khuyến khích họ thử nói tiếng Anh
          - Giữ cuộc trò chuyện thú vị và có tính giáo dục`
        },
        ...validHistory,
        {
          role: 'user' as const,
          content: userMessage
        }
      ];

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 200,
        temperature: 0.8,
      });

      return response.choices[0]?.message?.content || "I'm sorry, I didn't understand. Could you try again?";
    } catch (error) {
      console.error('AI Chat Error:', error);

      // Handle specific OpenAI errors
      if (error.status === 429) {
        return "I'm currently busy helping other students. Let me give you a simple response: Hello! I'm here to help you practice English. What would you like to talk about today?";
      } else if (error.status === 401) {
        return "I'm having some technical difficulties. But I can still help! Try asking me about English grammar, vocabulary, or practice conversations.";
      } else if (error.status === 403) {
        return "The AI service is temporarily unavailable. Meanwhile, you can practice by describing your day in English!";
      }

      // Fallback to simple responses based on common patterns
      const lowerMessage = userMessage.toLowerCase();
      if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        return "Hello! I'm your English practice partner. How are you today? Tell me about yourself in English!";
      } else if (lowerMessage.includes('how are you')) {
        return "I'm doing well, thank you for asking! How about you? Can you tell me what you did today?";
      } else if (lowerMessage.includes('help')) {
        return "I'm here to help you practice English! You can ask me about grammar, vocabulary, or just have a conversation. What would you like to practice?";
      } else if (lowerMessage.includes('goodbye') || lowerMessage.includes('bye')) {
        return "Goodbye! Keep practicing your English every day. You're doing great!";
      } else {
        return "That's interesting! Can you tell me more about that in English? I'm here to help you practice.";
      }
    }
  }

  // Assess difficulty level of a word
  async assessWordDifficulty(word: string, meaning: string): Promise<'beginner' | 'intermediate' | 'advanced'> {
    if (!this.openai) {
      return 'intermediate'; // Default fallback
    }

    try {
      const prompt = `Đánh giá độ khó của t�� tiếng Anh "${word}" (nghĩa: ${meaning}) cho người học tiếng Anh. Trả lời chỉ một từ: beginner, intermediate, hoặc advanced.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an English language assessment expert. Classify words by difficulty level for Vietnamese English learners.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 10,
        temperature: 0.3,
      });

      const level = response.choices[0]?.message?.content?.trim().toLowerCase();
      if (['beginner', 'intermediate', 'advanced'].includes(level)) {
        return level as 'beginner' | 'intermediate' | 'advanced';
      }
      return 'intermediate';
    } catch (error) {
      console.error('AI Difficulty Assessment Error:', error);
      return 'intermediate';
    }
  }

  // Generate pronunciation tip
  async generatePronunciationTip(word: string): Promise<string> {
    if (!this.openai) {
      return `Phát âm: /${word}/`;
    }

    try {
      const prompt = `Tạo mẹo phát âm tiếng Anh cho từ "${word}" bằng tiếng Việt, giúp người Việt phát âm đúng. Đưa ra lời khuyên ngắn gọn và dễ hiểu.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a pronunciation coach helping Vietnamese speakers learn English pronunciation. Give practical tips in Vietnamese.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 150,
        temperature: 0.7,
      });

      return response.choices[0]?.message?.content || `Luyện tập phát âm từ "${word}" thường xuyên.`;
    } catch (error) {
      console.error('AI Pronunciation Tip Error:', error);
      return `Luyện tập phát âm từ "${word}" thường xuyên.`;
    }
  }

  // Generate personalized learning suggestions
  async generateLearningPath(userLevel: string, weakAreas: string[], interests: string[]): Promise<string[]> {
    if (!this.openai) {
      return ['Tiếp tục học từ vựng cơ bản', 'Luyện tập ngữ pháp', 'Đọc sách tiếng Anh đơn giản'];
    }

    try {
      const prompt = `Tạo 5 gợi ý học tập cá nhân hóa cho học sinh tiếng Anh:
      - Trình độ: ${userLevel}
      - Điểm yếu: ${weakAreas.join(', ')}
      - Sở thích: ${interests.join(', ')}
      
      Đưa ra các gợi ý thực tế và có thể thực hiện được.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an experienced English learning advisor. Create personalized learning recommendations in Vietnamese.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 400,
        temperature: 0.8,
      });

      const content = response.choices[0]?.message?.content || '';
      return content.split('\n').filter(line => line.trim().length > 0).slice(0, 5);
    } catch (error) {
      console.error('AI Learning Path Error:', error);
      return [
        'Học 10 từ vựng mới mỗi ngày',
        'Luyện tập phát âm 15 phút/ngày',
        'Đọc tin tức tiếng Anh đơn giản',
        'Xem phim tiếng Anh có phụ đề',
        'Thực hành speaking với AI chat bot'
      ];
    }
  }

  // Check if AI is available
  isAIAvailable(): boolean {
    return !!this.openai;
  }
}
