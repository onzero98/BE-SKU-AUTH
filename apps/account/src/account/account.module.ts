import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { Account } from './account.model';
import { sequelizeConfig } from '../configs/sequelize.config';
import { SequelizeModule } from '@nestjs/sequelize';
import { KafkaService } from '../kafka/kafka.service';
import { AccountController } from './account.controller';
// import { KafkaHandler } from '../kafka/kafka.handler';

@Module({
  imports: [
    SequelizeModule.forRoot(sequelizeConfig),
    SequelizeModule.forFeature([Account])
  ],
  controllers: [AccountController],
  providers: [AccountService, KafkaService,],
  exports: [AccountService],
})
export class AccountModule {}
