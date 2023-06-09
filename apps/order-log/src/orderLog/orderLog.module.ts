import { Module } from '@nestjs/common';
import { OrderLogController } from './orderLog.controller';
import { OrderLogService } from './orderLog.service';
import { KafkaService } from '../kafka/kafka.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { OrderLog } from './orderLog.model';

@Module({
  imports: [
    SequelizeModule.forFeature([OrderLog]),
  ],
  controllers: [OrderLogController],
  providers: [OrderLogService, KafkaService],
})
export class OrderLogModule {}
