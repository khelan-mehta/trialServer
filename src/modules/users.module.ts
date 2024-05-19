import { Module } from '@nestjs/common';
import { UsersController } from '../controllers/users.controller';
import { UsersService } from '../services/users.service';
import { usersProviders } from '../services/users.provider';
import { DatabaseModule } from './database.module';
import { DiaryController } from '../controllers/diary.controller';
import { CalendarController } from '../controllers/calender.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '../database/schemas/user.schema';
import { AuthController } from 'src/controllers/auth.controller';
import { AuthService } from 'src/services/auth.service';
import { JwtService } from '../services/jwt.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { AppService } from 'src/services/app.service';
import { AppController } from 'src/controllers/app.controller';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  controllers: [
    UsersController,
    DiaryController,
    CalendarController,
    AuthController,
    AppController,
  ],
  providers: [
    UsersService,
    AuthService,
    AppService,
    JwtService,
    ...usersProviders,
  ],
})
export class UsersModule {}
