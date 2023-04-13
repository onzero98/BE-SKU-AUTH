import { Controller, Get } from '@nestjs/common';
import { StockPriceService } from './stockPrice.service';

@Controller('stockPrices')
export class StockPriceController {
  constructor(private readonly stockPriceService: StockPriceService) {}

  @Get()
  async getAllStockPrices() {
    return await this.stockPriceService.getAllStockPricesMain();
  }
}
