import { Model } from 'mongoose';
import { Injectable, Inject, ConflictException, NotFoundException } from '@nestjs/common';
import { User } from '../dto/interfaces/user.interface';
import { CreateUserDto } from '../dto/create-user.dto';
import { Diary } from '../dto/interfaces/diary.interface';
import { AddDiaryDto } from '../dto/add-diary.dto';
import { CalendarDataDto } from '../dto/calendar-data.dto';
import { JwtService } from '@nestjs/jwt';
import { faker } from '@faker-js/faker';
import {
  generateKeyPairSync,
  publicEncrypt,
  privateDecrypt,
  constants,
} from 'crypto';

@Injectable()
export class UsersService {
  protected usersCount = 0;
  protected diaryKey = null;

  constructor(
    @Inject('USER_MODEL')
    private userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  async checkUserIdExists(userId: string): Promise<boolean> {
    const user = await this.userModel.findOne({ userId });
    return !!user; // If user exists, return true; otherwise, return false
  }

  async getUserById(userId: string): Promise<User | null> {
    return await this.userModel.findOne({ userId });
  }

  async updateUser(userId: string, updateUserDto: any): Promise<User | null> {
    const updatedUser = await this.userModel.findOneAndUpdate(
      { userId },
      updateUserDto,
      {
        new: true,
      },
    );
    return updatedUser;
  }

  async generateDiarySign(dt: string | object) {
    // not a very good approach will change it later on
    this.diaryKey = generateKeyPairSync('rsa', {
      // 1024 is less safer then 2048, but it takes less size and
      // every diary is encrypted with different keys so one compromised no issues
      // as long as db is not compromised
      // symmetric should have been used will change it to that after exams

      modulusLength: 1024,
    });

    const encryptedData = publicEncrypt(
      {
        key: this.diaryKey.publicKey,
        padding: constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      // We convert the data string to a buffer, rearranges the data makes it look like sh!t
      Buffer.from(dt as string),
    );
    return encryptedData.toString('base64'); // better encoding would be utf-8 but lets try this for fun
  }

  async addOrUpdateDiary(addDiaryDto: AddDiaryDto): Promise<User | null> {
    const { userId, content, date, privacy, genres } = addDiaryDto;

    // Custom function to format date as 'm-d-yyyy' without leading zeros
    const formatDate = (date: Date): string => {
      const day = String(date.getDate());
      const month = String(date.getMonth() + 1);
      const year = String(date.getFullYear());
      return `${month}-${day}-${year}`;
    };

    try {
      const parsedDate = new Date(date);

      if (isNaN(parsedDate.getTime())) {
        throw new Error('Invalid date provided');
      }

      const dateString = formatDate(parsedDate);

      const user = await this.userModel.findOne({ userId });

      if (!user) {
        throw new Error('User not found');
      }

      const existingDiaryIndex = user.diaries.findIndex(
        (diary) => formatDate(new Date(diary.date)) === dateString,
      );

      let update;
      if (existingDiaryIndex !== -1) {
        // Diary for the current date already exists, update it
        update = {
          $set: {
            [`diaries.${existingDiaryIndex}`]: {
              date: dateString,
              content,
              privacy,
              genres,
            },
          },
        };
      } else {
        // Diary for the current date does not exist, add it
        update = {
          $push: {
            diaries: {
              date: dateString,
              content,
              privacy,
              genres,
            },
          },
        };
      }

      const updatedUser = await this.userModel.findOneAndUpdate(
        { userId },
        update,
        { new: true },
      );

      if (!updatedUser) {
        throw new Error('User not found after update');
      }

      console.log('Diary updated successfully');
      return updatedUser;
    } catch (error) {
      console.error('Error in addOrUpdateDiary:', error);
      return null;
    }
  }

  async createUser(createUserDto: CreateUserDto): Promise<void> {
    const userId = createUserDto.userId
    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: createUserDto },
      { new: true, upsert: false }, // upsert: false ensures it doesn't create a new user if not found
    );

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    } 
  
  }

  async findDiaryEntryByDateAndUserId(
    date: string,
    userId: string,
  ): Promise<any> {
    try {
      const user = await this.userModel.findOne({ userId: userId });

      if (!user) {
        return null;
      }

      const diaryEntry = user.diaries.find((diary) => diary.date === date);
      console.log(diaryEntry);

      return diaryEntry || null;
    } catch (error) {
      throw error;
    }
  }
  async saveCalendarData(
    userId: string,
    calendarDataDto: any,
  ): Promise<User | null> {
    try {
      const updatedUser = await this.userModel.findOneAndUpdate(
        { userId },
        { $set: { calendarData: calendarDataDto } },
        { new: true },
      );

      return updatedUser;
    } catch (error) {
      console.error('Error updating calendar data:', error);
      return null;
    }
  }

  async getCalendarData(userId: string) {
    const user = await this.userModel.findOne({ userId });
    if (!user) {
      // Handle user not found error
      throw new Error('User not found');
    }
    return user.calendarData;
  }

  async getRecommendedPosts(
    pageIdx: string,
    pageSize: string,
    usrGenres,
    userId: string,
  ) {
    try {
      // used to calculate the documents to skip, need to do aggregate pipeline for total counts - later
      let pgIdx = parseInt(pageIdx, 10) || 1;
      let pgSize = parseInt(pageSize, 10) || 10;

      const users = await this.userModel
        .find({ userId: { $ne: userId }, genres: { $in: usrGenres } })
        .select(['userId', 'diaries', 'avatar', 'username'])
        .skip((pgIdx - 1) * pgSize)
        .limit(10);

      // merge all diaries and shuffle to get random result instead of showing
      // diaries of one person consecutively
      // attach each diary with its author data and only latest page of diary

      const diaries = [];

      users.forEach((usr) => {
        let dairy = {
          usrId: usr.userId,
          page: usr.diaries[usr.diaries.length - 1] || null,
          avatar: usr.avatar,
          username: usr.username,
        };

        if (dairy.page) diaries.push(dairy); // if diaries exists then only push the profile
      });

      return diaries;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getUserGenrsById(userId: string): Promise<string[]> {
    try {
      const genrs = await this.userModel
        .findOne({ userId: userId })
        .select('genres'); // returns {_id, genres}
      // console.log(genrs);
      return genrs.genres;
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async seedDb(usrAmount: number) {
    let users = []; // makes a specified amounts of user
    for (let i = 0; i < usrAmount; i++) {
      users.push({
        userId: `user_${faker.string.uuid()}`,
        username: faker.animal.cat(),
        avatar: faker.image.avatar(),
        about: faker.string.alphanumeric(100),
        genres: Array.from({ length: 5 }, () => faker.lorem.word()), // 5 random words representing genres
        diary: [],
      });
    }

    await this.userModel.insertMany(users);
    return true;
  }
}
