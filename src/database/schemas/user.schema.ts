import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';

export const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: { type: String },
  userId: String,
  username: String,
  avatar: String,
  about: String,
  genres: [String],
  diaries: [
    {
      date: { type: String, required: true },
      content: { type: String, required: true },
      privacy: { type: Boolean, required: true },
      genres: { type: [String], required: true },
      sign: { type: String, required: true },
    },
  ],
  calendarData: String,
});
