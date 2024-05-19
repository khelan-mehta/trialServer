import { Document } from 'mongoose';
import { Diary } from './diary.interface';

export interface User extends Document {
  email: string;
  password: string;
  userId: string;
  username: string;
  avatar: string;
  about: string;
  genres: string[];
  diaries: Diary[];
  calendarData: string;
}
