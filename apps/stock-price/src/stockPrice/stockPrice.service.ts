import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { stockPrice } from '../stockPrice.model';
import { KafkaService } from '../kafka/kafka.service';

@Injectable()
export class StockPriceService implements OnModuleInit {

  constructor(
    @InjectModel(stockPrice) private readonly stockPriceModel: typeof stockPrice,
    private kafkaService: KafkaService,
  ) {}

  async onModuleInit() {
    await this.kafkaService.subscribe('reqCurrentPrice', this.handleGetCurrentPrice.bind(this));
  }

  async getAllStockPricesMain() {
    return await this.stockPriceModel.findAll({
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

  async getAllStockPrices() {
    return await this.stockPriceModel.findAll({
      attributes: [
        'code',
        'companyName',
        'currentPrice',
        'previousPriceDifference',
        'diffRate',
        'tradeVolume',
        'marketCapBillion'
      ],
      order: [['marketCapBillion', 'DESC']],
    });
  }

  async handleGetCurrentPrice(message: any): Promise<void> {
    const { code, orderId } = message;

    const stockPrice = await this.stockPriceModel.findOne({ where: { code } });
    if (stockPrice) {
      await this.kafkaService.publish('resCurrentPrice', {
        orderId,
        code,
        currentPrice: stockPrice.currentPrice,
      });
    } else {
      await this.kafkaService.publish('resCurrentPrice', {
        orderId,
        code,
        currentPrice: null,
      });
    }
  }

}
