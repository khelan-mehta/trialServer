// add-diary.dto.ts
import { IsNotEmpty, IsString, IsDateString } from 'class-validator';

export class AddDiaryDto {
  userId: string; // Ensure this represents the user ID as a string, not necessarily an ObjectId
  content: string;
  date: string;
  privacy: boolean;
  genres: string[];
}
 