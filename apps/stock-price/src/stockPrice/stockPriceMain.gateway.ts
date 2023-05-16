import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { StockPriceService } from './stockPrice.service';

@WebSocketGateway({ path: '/stock-prices-main' })
export class StockPriceMainGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server: Server;
  private clients: Socket[] = [];

  constructor(private readonly stockPriceService: StockPriceService) {
    this.fetchAndBroadcastData();
  }

  handleConnection(client: Socket): void {
    this.clients.push(client);
  }

  handleDisconnect(client: Socket): void {
    this.clients = this.clients.filter((c) => c.id !== client.id);
  }

  async fetchAndBroadcastData() {
    const stockData = await this.stockPriceService.getAllStockPricesMain();

    this.clients.forEach((client) => {
      client.emit('stockDataMain', stockData);
    });

    setTimeout(() => this.fetchAndBroadcastData(), 3000);
  }

  @SubscribeMessage('stockDataMain')
  async handleStockData(client: Socket) {
    const stockData = await this.stockPriceService.getAllStockPricesMain();
    client.emit('stockDataMain', stockData);
  }
}