import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { StockPriceService } from './stockPrice.service';

@WebSocketGateway({ path: '/stock-prices-all' })
export class StockPriceAllGateway implements OnGatewayConnection, OnGatewayDisconnect {
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
    const stockData = await this.stockPriceService.getAllStockPrices();

    this.clients.forEach((client) => {
      client.emit('stockDataAll', stockData);
    });

    setTimeout(() => this.fetchAndBroadcastData(), 3000);
  }

  @SubscribeMessage('stockDataAll')
  async handleStockData(client: Socket) {
    const stockData = await this.stockPriceService.getAllStockPrices();
    client.emit('stockDataAll', stockData);
  }
}
