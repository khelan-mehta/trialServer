// calendar.controller.ts
import { Controller, Post, Body, Get, Param, Put } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CalendarDataDto } from '../dto/calendar-data.dto';
import { User } from '../dto/interfaces/user.interface';

@Controller('calendar')
export class CalendarController {
  constructor(private readonly usersService: UsersService) {}

  @Put(':userId')
  async updateUserCalendarData(
    @Param('userId') userId: string,
    @Body() calendarDataDto: CalendarDataDto,
  ): Promise<User | null> {
    const stringed = JSON.stringify(calendarDataDto);
    return this.usersService.saveCalendarData(userId, stringed);
  }

  @Get(':userId')
  async getCalendarData(@Param('userId') userId: string) {
    return this.usersService.getCalendarData(userId);
  }
}
