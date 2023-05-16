import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { KafkaService } from '../kafka/kafka.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Order } from './order.model';

@Module({
  imports: [
    SequelizeModule.forFeature([Order]),
  ],
  controllers: [OrderController],
  providers: [OrderService, KafkaService],
})
export class OrderModule {}
