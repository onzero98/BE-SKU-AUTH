import { Injectable } from '@nestjs/common';
import { stockPrice } from '../stockPrice.model';

@Injectable()
export class StockPriceService {
  async getAllStockPricesMain() {
    return await stockPrice.findAll({
      attributes: [
        'code',
        'companyName',
        'currentPrice',
        'diffRate',
        'tradeVolume',
      ],
      order: [['marketCapBillion', 'DESC']],
      limit: 7
    });
  }
}
