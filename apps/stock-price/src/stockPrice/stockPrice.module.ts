import { Module } from '@nestjs/common';
import { StockPriceService } from './stockPrice.service';
import { StockPriceController } from './stockPrice.controller';

@Module({
  providers: [StockPriceService],
  controllers: [StockPriceController],
  exports: [StockPriceService],
})
export class StockPriceModule {}
