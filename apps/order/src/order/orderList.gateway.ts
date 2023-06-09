import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OrderService } from './order.service';

interface ExtendedSocket extends Socket {
  username: string;
}

@WebSocketGateway({ path: '/order-list' })
export class OrderListGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server: Server;
  private clients: ExtendedSocket[] = [];

  constructor(private readonly orderService: OrderService) {
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
      const listData = await this.orderService.getUserOrderLists(client.username);
      client.emit('orderListUSer', listData);
    });

    setTimeout(() => this.fetchAndBroadcastData(), 3000);
  }

  @SubscribeMessage('orderListUSer')
  async handleStockData(client: ExtendedSocket, ...args: any[]) {
    const listData = await this.orderService.getUserOrderLists(args[0].handshake.query.username);
    client.emit('orderListUSer', listData);
  }
}
