import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { sequelizeConfig } from './configs/sequelize.config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    SequelizeModule.forRoot(sequelizeConfig),
    AuthModule,
    UserModule,
  ],
})
export class AppModule {}