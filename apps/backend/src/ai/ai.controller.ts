import { Controller, Post, Get, Body, UseGuards, Request, Query } from '@nestjs/common';
import { AIService } from './ai.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { IsString, IsArray, IsOptional } from 'class-validator';

class ChatMessageDto {
  @IsString()
  message: string;

  @IsOptional()
  @IsArray()
  conversationHistory?: Array<{role: string, content: string}>;
}

class GenerateExamplesDto {
  @IsString()
  word: string;

  @IsString()
  meaning: string;
}

class AssessLearningDto {
  @IsString()
  userLevel: string;

  @IsArray()
  weakAreas: string[];

  @IsArray()
  interests: string[];
}

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Get('status')
  async getAIStatus() {
    return {
      available: this.aiService.isAIAvailable(),
      message: this.aiService.isAIAvailable()
        ? 'AI services are available'
        : 'AI services are currently unavailable'
    };
  }

  @Post('chat')
  async chatWithAI(@Body() chatData: ChatMessageDto, @Request() req) {
    const { message, conversationHistory = [] } = chatData;

    const aiResponse = await this.aiService.chatWithAI(message, conversationHistory);

    return {
      userMessage: message,
      aiResponse,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('generate-examples')
  async generateExamples(@Body() data: GenerateExamplesDto) {
    const { word, meaning } = data;

    const examples = await this.aiService.generateExampleSentences(word, meaning);

    return {
      word,
      meaning,
      examples,
      generatedAt: new Date().toISOString(),
    };
  }

  @Post('assess-difficulty')
  async assessWordDifficulty(@Body() data: GenerateExamplesDto) {
    const { word, meaning } = data;

    const difficulty = await this.aiService.assessWordDifficulty(word, meaning);

    return {
      word,
      meaning,
      difficulty,
      assessedAt: new Date().toISOString(),
    };
  }

  @Get('pronunciation-tip')
  async getPronunciationTip(@Query('word') word: string) {
    if (!word) {
      return { error: 'Word parameter is required' };
    }

    const tip = await this.aiService.generatePronunciationTip(word);

    return {
      word,
      pronunciationTip: tip,
      generatedAt: new Date().toISOString(),
    };
  }

  @Post('learning-path')
  async generateLearningPath(@Body() data: AssessLearningDto, @Request() req) {
    const { userLevel, weakAreas, interests } = data;

    const suggestions = await this.aiService.generateLearningPath(userLevel, weakAreas, interests);

    return {
      userId: req.user.userId,
      userLevel,
      weakAreas,
      interests,
      suggestions,
      generatedAt: new Date().toISOString(),
    };
  }

  @Get('study-motivation')
  async getStudyMotivation(@Request() req) {
    const motivationalMessages = [
      "Tuyệt vời! Bạn đang trên con đường chinh phục tiếng Anh! 🌟",
      "Mỗi từ vựng bạn học được là một bước tiến gần hơn đến thành công! 💪",
      "Kiên trì là chìa khóa thành công trong việc học ngôn ngữ! 🔑",
      "Bạn đã làm rất tốt rồi! Hãy tiếp tục cố gắng! 🚀",
      "Học tiếng Anh mỗi ngày sẽ mở ra nhiều cơ hội mới! ✨"
    ];

    const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

    return {
      message: randomMessage,
      tip: "Hãy học ít nhất 5 từ vựng mới mỗi ngày và ôn tập thường xuyên!",
      timestamp: new Date().toISOString(),
    };
  }
}
