import { Controller, Get } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';

@Controller()
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get()
  getHello(): string {
    return this.portfolioService.getHello();
  }
}
