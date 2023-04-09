import { Injectable } from '@nestjs/common';
import { KafkaService } from './kafka.service';

@Injectable()
export class KafkaHandler {
  constructor(private kafkaService: KafkaService) {}

  async handleSignIn(message: any): Promise<void> {
    console.log(`Received message: ${JSON.stringify(message)}`);
  }

  async handleSignUp(message: any): Promise<{ username: string; password: string }> {
    return { username: message.username, password: message.password };
  }
}
