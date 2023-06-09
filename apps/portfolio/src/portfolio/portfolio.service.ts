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
    await this.kafkaService.subscribe('updatePortfolio', this.handleUpdatePortfolio.bind(this));
    await this.kafkaService.subscribe('reqPortfolioAmount', this.handleReqPortfolioAmount.bind(this));
    await this.kafkaService.subscribe('reqAvgPrice', this.handleReqAvgPrice.bind(this));
  }

  async handleUpdatePortfolio(message: any): Promise<void> {
    const { username, code, companyName, amount, price, method, status } = message;
    const portfolio = await this.portfolioModel.findOne({ where: { username, code } });

    if (method === 'B') {
      if (!portfolio) {
        await this.portfolioModel.create({ username, code, companyName, amount, boughtPrice:price*amount });
      } else {
        portfolio.amount += amount;
        portfolio.boughtPrice += status === 'C' ? ( portfolio.avgPrice * amount ) : ( price * amount );
        await portfolio.save();
      }
    } else if (method === 'S' && portfolio) {
      portfolio.amount -= amount;
      portfolio.boughtPrice -= portfolio.avgPrice * amount;
      await portfolio.save();
    }
  }

  async handleReqPortfolioAmount(message: any): Promise<void> {
    const { username, code, amount, orderId, } = message;
    const portfolio = await this.portfolioModel.findOne({ where: { username, code } });

    if (portfolio && portfolio.amount >= amount) {

      portfolio.amount -= amount;
      portfolio.boughtPrice -= portfolio.avgPrice * amount;
      portfolio.save();

      await this.kafkaService.publish('resPortfolioAmount', {
        orderId,
        username,
        code,
        amount,
        status: 'Passed',
      });
    } else {
      await this.kafkaService.publish('resPortfolioAmount', {
        orderId,
        username,
        code,
        amount,
        status: 'Failed',
      });
    }
  }

  async getOnePortfolio(message: any): Promise<any> {
    const { username, code } = message;
    const result = await this.portfolioModel.findOne({ where: { username, code } });

    if(result){
      return result.dataValues;
    } else {
      return { amount: 0 }
    }
  }

  async getAllPortfolio(username: string): Promise<any[]> {
    const result = await this.portfolioModel.findAll({
      where: {
        username: username,
      },
    });

    return result.map(res => res.dataValues);
  }

  async handleReqAvgPrice(message: any): Promise<void> {
    const { username, code } = message;
    const result = await this.portfolioModel.findOne({ where: { username, code } });
    if(result){
      await this.kafkaService.publish('resAvgPrice', result.dataValues.avgPrice);
    }
  }
}
