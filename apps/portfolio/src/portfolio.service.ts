import { Injectable } from '@nestjs/common';

@Injectable()
export class PortfolioService {
  getHello(): string {
    return 'Hello World!';
  }
}
