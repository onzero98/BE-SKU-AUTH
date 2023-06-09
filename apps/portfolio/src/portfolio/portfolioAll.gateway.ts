import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PortfolioService } from './portfolio.service';

interface ExtendedSocket extends Socket {
  username: string;
}

@WebSocketGateway({ path: '/portfolio-all' })
export class PortfolioAllGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server: Server;
  private clients: ExtendedSocket[] = [];

  constructor(private readonly portfolioService: PortfolioService) {
    this.fetchAndBroadcastData();
  }

  handleConnection(client: ExtendedSocket): void {
    if (typeof client.handshake.query.username === 'string') {
      client.username = client.handshake.query.username;
    }
    this.clients.push(client);
  }

  handleDisconnect(client: ExtendedSocket): void {
    this.clients = this.clients.filter((c) => c.id !== client.id);
  }

  async fetchAndBroadcastData() {
    this.clients.forEach(async (client) => {
      const portfolioData = await this.portfolioService.getAllPortfolio(client.username);
      client.emit('portfolioAll', portfolioData);
    });

    setTimeout(() => this.fetchAndBroadcastData(), 3000);
  }

  @SubscribeMessage('portfolioAll')
  async handleStockData(client: ExtendedSocket, ...args: any[]) {
    const portfolioData = await this.portfolioService.getAllPortfolio(args[0].handshake.query.username);
    client.emit('portfolioAll', portfolioData);
  }
}
