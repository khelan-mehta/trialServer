import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../dto/interfaces/user.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get('/exists/:userId')
  async checkUserIdExists(@Param('userId') userId: string): Promise<boolean> {
    return await this.userService.checkUserIdExists(userId);
  }

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto): Promise<void> {
    await this.userService.createUser(createUserDto);
  }

  @Get(':userId')
  async getUserById(@Param('userId') userId: string): Promise<User | null> {
    return await this.userService.getUserById(userId);
  }

  @Get(':userId/diaries/:date')
  async findDiaryEntryByDateAndUserId(
    @Param('date') date: string,
    @Param('userId') userId: string,
  ): Promise<any> {
    return await this.userService.findDiaryEntryByDateAndUserId(date, userId);
  }

  @Put(':userId')
  async updateUser(
    @Param('userId') userId: string,
    @Body() updateUserDto: any,
  ): Promise<User> {
    const updatedUser = await this.userService.updateUser(
      userId,
      updateUserDto,
    );
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
    return updatedUser;
  }
}
