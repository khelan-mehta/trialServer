import { Diary } from './interfaces/diary.interface';

export class CreateUserDto {
  userId: string;
  username: string;
  avatar: string;
  about: string;
  genres: string[];
  diaries: Diary[];
  calendarData: string;
}
