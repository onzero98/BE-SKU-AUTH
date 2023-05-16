import { Controller, Post, Body } from '@nestjs/common';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('create')
  async handleCreateOrder(@Body() orderData: any): Promise<any> {
    return await this.orderService.handleCreateOrder(orderData);
  }
}
