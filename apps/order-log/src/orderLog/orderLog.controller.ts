import { Controller, Post, Body } from '@nestjs/common';
import { OrderLogService } from './orderLog.service';

@Controller('orderLog')
export class OrderLogController {
  constructor(private readonly orderLogService: OrderLogService) {}

}
