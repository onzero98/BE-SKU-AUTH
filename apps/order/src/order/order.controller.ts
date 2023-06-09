import { Controller, Post, Body, Res } from '@nestjs/common';
import { OrderService } from './order.service';
import { Response } from 'express';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('create')
  async handleCreateOrder(@Body() orderData: any): Promise<any> {
    return await this.orderService.handleCreateOrder(orderData);
  }

  @Post('cancel')
  async handleCancelOrder(@Body() orderData: any): Promise<any> {
    return await this.orderService.handleCancelOrder(orderData);
  }

  @Post('get/amount')
  async handleGetAmountStock(@Body() orderData: any, @Res() res: Response): Promise<any> {
    const result = await this.orderService.handleGetAmountStock(orderData);
    res.status(200).json(parseInt(result));
  }
}
