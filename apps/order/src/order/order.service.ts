import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { KafkaService } from '../kafka/kafka.service';
import { Order } from './order.model';
import { Sequelize } from 'sequelize';
import * as crypto from 'crypto';

@Injectable()
export class OrderService implements OnModuleInit {
  constructor(
    @InjectModel(Order) private readonly orderModel: typeof Order,
    private kafkaService: KafkaService,
  ) {}

  private waitingOrders: Map<string, Set<string>> = new Map();

  async onModuleInit() {
    await this.kafkaService.subscribe('createOrder', this.handleCreateOrder.bind(this));
    await this.kafkaService.subscribe('cancelOrder', this.handleCancelOrder.bind(this));
    await this.kafkaService.subscribe('resAccountCreditUpdate', this.handleAccountCreditResponse.bind(this));
    await this.kafkaService.subscribe('resPortfolioAmount', this.handlePortfolioAmountResponse.bind(this));
    await this.kafkaService.subscribe('resCurrentPrice', this.handleCurrentPriceResponse.bind(this));
    await this.kafkaService.subscribe('stockPriceUpdated', this.handleStockPriceUpdated.bind(this));
  }

  async createOrder(orderData: any): Promise<any> {
    let orderId;
    const { method } = orderData;

    const currentDate = new Date();
    const timezoneOffset = currentDate.getTimezoneOffset() * 60000;
    const localISOTime = new Date(currentDate.getTime() - timezoneOffset).toISOString();
    const formattedDate = localISOTime.slice(0, 10).replace(/-/g, '');

    while (true) {
      const randomString = crypto.randomBytes(3).toString('hex').toUpperCase();
      orderId = `O${method}${formattedDate}${randomString}`;
      const existingOrder = await this.orderModel.findOne({
        where: {
          orderId: orderId,
        },
      });
  
      if (!existingOrder) {
        break;
      }
    }

    const order = await this.orderModel.create({ ...orderData, status: 'W', orderId });
    return order.dataValues ;
  }
  
  // 주문 생성 처리
  async handleCreateOrder(message: any): Promise<void> {
    const { username, method, companyName, code, price, amount } = message;
    const result = await this.createOrder({...message});

    this.addWaitingOrder(result);
    if (method === 'B') {
      await this.kafkaService.publish('reqAccountCreditUpdate', {
        orderId: result.orderId,
        method,
        username,
        amount : price * amount,
      });
    } else {
      await this.kafkaService.publish('reqPortfolioAmount', {
        orderId: result.orderId,
        username,
        code,
        amount,
      });
    }
  }

  // 주문 취소 상태 처리
  async handleCancelOrder(message: any): Promise<void> {
    const { orderId, method, username, amount, price } = message;
    const order = await this.orderModel.findOne({ where: { orderId } })
    if (order && order.status === 'W') {
      if(order.method === 'B'){
        order.status = 'C';
        this.removeWaitingOrder(order);
        await this.kafkaService.publish('orderStatusUpdated', order);
        await order.destroy();
        
        await this.kafkaService.publish('reqAccountCreditUpdate', {
          orderId,
          method: 'S',
          username,
          amount : price * amount,
        });
      } else if (order.method === 'S'){
        order.status = 'C';
        this.removeWaitingOrder(order);
        await this.kafkaService.publish('orderStatusUpdated', order);
        await order.destroy();

        await this.kafkaService.publish('updatePortfolio', {
          username: order.username,
          code: order.code,
          companyName: order.companyName,
          amount: order.amount,
          price: order.price,
          method: 'B',
          status: 'C'
        });
      }
    } 
  }

  //
  async handleAccountCreditResponse(message: any): Promise<void> {
    const { success, orderId } = message;
    const order = await this.orderModel.findOne({ where: { orderId } })
  
    if (order && order.status === 'W') {
      if (success) {
        if (order.method === 'B') {
          await this.kafkaService.publish('reqCurrentPrice', {
            code: order.code,
            orderId: order.orderId,
          });
        }
      } else {
        // 크레딧이 부족할 경우, 주문 상태 변경
        order.status = 'F';
        this.removeWaitingOrder(order);
        await this.kafkaService.publish('orderStatusUpdated', order);
        await order.destroy();
      }
    }
  }
  

  async handlePortfolioAmountResponse(message: any): Promise<void> {
    // // Account 모듈의 credit 조회 응답 처리
    const { username, code, amount, orderId, status } = message;
    const order = await this.orderModel.findOne({ where: { username, code, orderId } });
    
    if (order && order.status === 'W') {
    // 포폴에 있는 양보다 같거나 적을 경우에만 계산
    if (status === 'Passed') {
      await this.kafkaService.publish('reqCurrentPrice', {
        code,
        orderId: order.orderId,
      });
    } else {
      // 주식 수량 부족할 경우, 주문 상태 변경
        order.status = 'F';
        this.removeWaitingOrder(order);
        await this.kafkaService.publish('orderStatusUpdated', order);
        await order.destroy();
      }
    }
  }

  async handleStockPriceUpdated(message: any): Promise<void> {
    const { code } = message;const orderIds = this.waitingOrders.get(code);
    if (orderIds) {
      for (const orderId of orderIds) {
        await this.kafkaService.publish('reqCurrentPrice', {
          orderId,
          code,
        });
      }
    }
  }

  private addWaitingOrder(order: Order): void {
    const { code, orderId } = order;
    if (!this.waitingOrders.has(code)) {
      this.waitingOrders.set(code, new Set());
    }
    this.waitingOrders.get(code).add(orderId);
  }
  
  private removeWaitingOrder(order: Order): void {
    const { code, orderId } = order;
    if (this.waitingOrders.has(code)) {
      this.waitingOrders.get(code).delete(orderId);
      if (this.waitingOrders.get(code).size === 0) {
        this.waitingOrders.delete(code);
      }
    }
  }
  
  async handleCurrentPriceResponse(message: any): Promise<void> {
    const { orderId, code, currentPrice } = message;
    const order = await this.orderModel.findOne({ where: { orderId } });
    
    if (order && order.status === 'W') {
      if (order.method === 'B' && order.price >= currentPrice) {
        // 매수 주문이며, 주문 가격이 현재 가격보다 높거나 같을 때
        await this.kafkaService.publish('updatePortfolio', {
          username: order.username,
          code: order.code,
          companyName: order.companyName,
          amount: order.amount,
          price: order.price,
          method: 'B',
          status: order.status
        });
  
        order.status = 'P';
        this.removeWaitingOrder(order);
        await this.kafkaService.publish('orderStatusUpdated', order);
        await order.destroy();

      } else if (order.method === 'S' && order.price <= currentPrice) {
        // 매도 주문이며, 주문 가격이 현재 가격보다 낮거나 같을 때
        const totalAmountCredit = order.amount * currentPrice;
        await this.kafkaService.publish('reqAccountCreditUpdate', {
          orderId: order.orderId,
          method: 'S',
          username: order.username,
          amount: totalAmountCredit,
        });
  
        order.status = 'P';
        this.removeWaitingOrder(order);
        await this.kafkaService.publish('orderStatusUpdated', order);
        await order.destroy();

      } else {
        setTimeout(() => {
          this.kafkaService.publish('reqCurrentPrice', {
            orderId: order.orderId,
            code,
          });
        }, 3000);
      }
    }
  }  

  async getUserOrderLists(username: string): Promise<any[]> {
    const orders = await this.orderModel.findAll({
      where: {
        username: username,
        status: 'W',
      },
    });
    return orders.map(order => order.dataValues);
  }
  
  async handleGetAmountStock(message: any): Promise<any> {
    const { username, code } = message;
    const totalAmount = await this.orderModel.findAll({
        where: { username, code, method:'S' },
        attributes: [[Sequelize.fn('sum', Sequelize.col('amount')), 'amount']],
        raw: true
    });
    return totalAmount[0].amount;
  }
}
