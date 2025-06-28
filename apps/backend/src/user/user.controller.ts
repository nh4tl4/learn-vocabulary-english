import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { SetDailyGoalDto } from '../vocabulary/dto/learning.dto';
import { IsString, IsOptional } from 'class-validator';

class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;
}

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  async getProfile(@Request() req) {
    return this.userService.findOne(req.user.userId);
  }

  @Get('stats')
  async getStats(@Request() req) {
    return this.userService.getUserStats(req.user.userId);
  }

  @Put('profile')
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.userService.updateProfile(req.user.userId, updateProfileDto);
  }

  @Put('daily-goal')
  async setDailyGoal(@Request() req, @Body() goalData: SetDailyGoalDto) {
    return this.userService.setDailyGoal(req.user.userId, goalData.dailyGoal);
  }
}
