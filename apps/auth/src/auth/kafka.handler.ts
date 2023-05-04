import { Injectable, UnauthorizedException } from '@nestjs/common';
import { KafkaService } from './kafka.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class KafkaHandler {
  constructor(
    private kafkaService: KafkaService,
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async handleSignIn(message: any): Promise<void> {
    console.log(`Received message: ${JSON.stringify(message)}`);
  }

  async handleSignUp(message: any): Promise<{ username: string; password: string }> {
    const user = await this.userService.findByUsername(message.username);
    
    if (user) {
      await this.kafkaService.publish('makeAccount', { user });
    } else {
      await this.kafkaService.publish('makeAccount', { userNotFound: true });
    }

    return { username: message.username, password: message.password };
  }

  async handleFindUsername(message: any): Promise<void> {
    const { username } = message;
    const user = await this.userService.findByUsername(username);
    if (user) {
      await this.kafkaService.publish('findUsernameResult', { user });
    } else {
      await this.kafkaService.publish('findUsernameResult', { userNotFound: true });
    }
  }
  
  async handleUpdateHasAccount(message: any): Promise<void> {
    const { username } = message;
    await this.userService.updateHasAccount(username);
  }
}
