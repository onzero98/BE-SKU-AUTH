import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { KafkaService } from '../kafka/kafka.service';
import { Order } from './order.model';
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
    // await this.kafkaService.subscribe('cancelOrder', this.handleCancelOrder.bind(this));
    await this.kafkaService.subscribe('resAccountCreditUpdate', this.handleAccountCreditResponse.bind(this));
    await this.kafkaService.subscribe('resPortfolioAmount', this.handlePortfolioAmountResponse.bind(this));
    await this.kafkaService.subscribe('resCurrentPrice', this.handleCurrentPriceResponse.bind(this));
    await this.kafkaService.subscribe('stockPriceUpdated', this.handleStockPriceUpdated.bind(this));
  }

  async createOrder(orderData: any): Promise<any> {
    let orderId;

    const currentDate = new Date();
    const timezoneOffset = currentDate.getTimezoneOffset() * 60000;
    const localISOTime = new Date(currentDate.getTime() - timezoneOffset).toISOString();
    const formattedDate = localISOTime.slice(0, 10).replace(/-/g, '');

    while (true) {
      const randomString = crypto.randomBytes(3).toString('hex').toUpperCase();
      orderId = `O-${formattedDate}${randomString}`;
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

    const { username, method, companyName, code, targetPrice, amount } = message;
    const result = await this.createOrder({...message});

    this.addWaitingOrder(result);

    await this.kafkaService.publish('reqPortfolioAmount', {
      orderId: result.orderId,
      username,
      code,
      amount,
    });
  }

  async handleCancelOrder(message: any): Promise<void> {
    const { id } = message.value;

    const order = await this.orderModel.findByPk(id);
    if (order && order.status === 'W') {
      order.status = 'C';
      await order.save();
    }
  }

  // 각 모듈의 응답 처리
  async handleAccountCreditResponse(message: any): Promise<void> {
    const { success, orderId } = message.value;
    const order = await this.orderModel.findByPk(orderId);
if (order && order.status === 'W') {
  if (success) {
    order.status = 'P';
  } else {
    order.status = 'F';
  }
  await order.save();
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
          orderId: order.id,
        });
      } else {
        // 주식 수량 부족할 경우, 주문 상태 변경
        order.status = 'F';
        this.removeWaitingOrder(order);
        await order.save();
      }
    }
  }

  async handleStockPriceUpdated(message: any): Promise<void> {
    const { code } = message;

    const orderIds = this.waitingOrders.get(code);
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
    // stock-price 모듈의 주식 현재 가격 조회 응답 처리
    const { orderId, code, currentPrice } = message;
    const order = await this.orderModel.findByPk(orderId);
if (order && order.status === 'W') {
  if (order.price <= currentPrice) {
    // 가격 조건 만족 시, 계좌에 금액 증가 요청
    const totalAmountCredit = order.amount * currentPrice;
    await this.kafkaService.publish('reqAccountCreditUpdate', {
      username: order.username,
      amount: totalAmountCredit,
      orderId: order.id,
    });

    order.status = 'P';
    this.removeWaitingOrder(order);
    await order.save();
  } else {
    setTimeout(() => {
          this.kafkaService.publish('reqCurrentPrice', {
            orderId: order.id,
            code,
          });
        }, 3000);
  }
}
  }
}
