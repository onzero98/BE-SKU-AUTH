import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { KafkaService } from '../kafka/kafka.service';
import { OrderLog } from './orderLog.model';
import * as crypto from 'crypto';

@Injectable()
export class OrderLogService implements OnModuleInit {
  private setAvgPrice: number | null = null;

  constructor(
    @InjectModel(OrderLog) private readonly orderLogModel: typeof OrderLog,
    private kafkaService: KafkaService,
  ) {}

  async onModuleInit() {
    await this.kafkaService.subscribe('orderStatusUpdated', this.handleOrderStatusUpdated.bind(this));
    await this.kafkaService.subscribe('resAvgPrice', this.handleResAvgPrice.bind(this));
  }

  async handleResAvgPrice(message: any): Promise<void> {
    this.setAvgPrice = message;
  }

  async handleOrderStatusUpdated(message: any): Promise<void> {
    const { orderId, status, username, companyName, code, amount, method, price, } = message;
    
    if(method === 'B'){
      await this.orderLogModel.create({orderId, status, username, companyName, code, amount, method, price, profit: 0});
    } 
    
    else if (method === 'S'){
      await this.kafkaService.publish('reqAvgPrice', { username, code });

      while(this.setAvgPrice === null) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      await this.orderLogModel.create({orderId, status, username, companyName, code, amount, method, price, profit: status ==='C' ? 0 : (price - this.setAvgPrice) * amount});
      this.setAvgPrice = null;
    }
  }
}