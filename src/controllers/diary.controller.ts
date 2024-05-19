import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { AddDiaryDto } from '../dto/add-diary.dto';

@Controller('diary')
export class DiaryController {
  constructor(private readonly userService: UsersService) {}

  @Post()
  async addOrUpdateDiary(@Body() addDiaryDto: AddDiaryDto): Promise<string> {
    try {
      await this.userService.addOrUpdateDiary(addDiaryDto);
      return 'Diary submitted successfully';
    } catch (error) {
      console.error('Error submitting diary:', error);
      throw new Error('Failed to submit diary');
    }
  }
}
