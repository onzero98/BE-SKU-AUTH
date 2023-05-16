import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { KafkaService } from '../kafka/kafka.service';
import { Portfolio } from './portfolio.model';

@Injectable()
export class PortfolioService implements OnModuleInit {
  constructor(
    @InjectModel(Portfolio) private readonly portfolioModel: typeof Portfolio,
    private kafkaService: KafkaService,
  ) {}

  async onModuleInit() {
    await this.kafkaService.subscribe('reqPortfolioAmount', this.handlePortfolioAmountRequest.bind(this));
  }

  async handlePortfolioAmountRequest(message: any): Promise<void> {
    const { orderId, username, code, amount } = message;

    const portfolio = await this.portfolioModel.findOne({ where: { username, code } });
    console.log(portfolio);
    if (portfolio) {
      if(portfolio.amount >= amount) {
        portfolio.amount -= amount;
        await portfolio.save();

        await this.kafkaService.publish('resPortfolioAmount', {
          username,
          code,
          orderId,
          amount: portfolio.amount,
          status: 'Passed'
        });
      } else {
        await this.kafkaService.publish('resPortfolioAmount', {
          username,
          code,
          orderId,
          amount: portfolio.amount,
          status: 'Failed'
        });
      }
    } else {
      await this.kafkaService.publish('resPortfolioAmount', {
        username,
        code,
        orderId,
        amount: 0,
        status: 'Failed'
      });
    }
  }
}
