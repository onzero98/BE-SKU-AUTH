import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { KafkaHandler } from './kafka.handler';
import { KafkaService } from './kafka.service';
import * as config from 'config';
import { UserModule } from '../user/user.module';

const jwtConfig = config.get('jwt');

@Module({
  imports: [
    UserModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || jwtConfig.secret,
      signOptions: {
        expiresIn: jwtConfig.expiresIn,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, KafkaHandler, KafkaService],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
