import { Module } from '@nestjs/common';
import { StockPriceService } from './stockPrice.service';
import { StockPriceController } from './stockPrice.controller';
import { KafkaService } from '../kafka/kafka.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { stockPrice } from '../stockPrice.model';

@Module({
  imports: [
    SequelizeModule.forFeature([stockPrice])
  ],
  providers: [StockPriceService, KafkaService],
  controllers: [StockPriceController],
  exports: [StockPriceService],
})
export class StockPriceModule {}
