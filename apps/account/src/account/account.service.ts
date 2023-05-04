import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Account } from './account.model';
import { KafkaService } from '../kafka/kafka.service';
// import { KafkaHandler } from '../kafka/kafka.handler';

@Injectable()
export class AccountService {
  private findUsernameResult: boolean | null = null;

  constructor(
    @InjectModel(Account) private readonly accountModel: typeof Account,
    private kafkaService: KafkaService,
    // private kafkaHandler: KafkaHandler,
  ) {
    this.initializeKafkaListener();
  }

  async initializeKafkaListener() {
    await this.kafkaService.subscribe('makeAccount', async (message) => {
      try {
        this.findUsernameResult = await this.handleFindUsername(message);
      } catch (error) {
        console.error(error);
      }
    });
  }

  async createAccount(username: string): Promise<{ result: boolean }> {
    this.findUsernameResult = null;
    await this.kafkaService.publish('findUsername', { username });

    while (this.findUsernameResult === null) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return { result: this.findUsernameResult };
  }

  async handleCreateAccount(message: any): Promise<void> {
    console.log('Received message in handleCreateAccount:', message);
    if (!message || !message.username) {
      console.error('Invalid message format:', message);
      return;
    }
    const { username } = message;
    await this.createAccount(username);
  }
  

  async handleFindUsername(message: any): Promise<any> {
    if (message.userNotFound) {
      return false;
    } else if (message.user.username) {
      const username = message.user.username;

      const existingAccount = await this.accountModel.findOne({ where: { username } });
      if (existingAccount) {
        return false;
      }

      const account = new Account();
      account.username = username;
      account.credit = 1000000;
      await account.save();
      await this.kafkaService.publish('updateHasAccount', { username });
      return true;
    } else {
      return false;
    }
  }
}
