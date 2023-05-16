import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Consumer, logLevel } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleDestroy {
  private kafka: Kafka;
  private consumer: Consumer;

  constructor() {
    this.kafka = new Kafka({
      clientId: 'nestjs-portfolio-module',
      brokers: ['localhost:9093'],
      logLevel: logLevel.INFO,
    });
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }

  async publish(topic: string, message: object) {
    const producer = this.kafka.producer();
    await producer.connect();
    await producer.send({
      topic: topic,
      messages: [{ value: JSON.stringify(message) }],
    });
    await producer.disconnect();
  }

  async subscribe(topic: string, callback: (message: any) => Promise<any>): Promise<void> {
    const cur_group = 'nestjs-portfolio-group-' + topic;
    const consumer = this.kafka.consumer({
      groupId: cur_group,
      heartbeatInterval: 3000,
      sessionTimeout: 10000,
    });
  
    await consumer.connect();
    await consumer.subscribe({ topic: topic, fromBeginning: true });
  
    consumer.run({
      eachMessage: async ({ message }) => {
        const parsedMessage = JSON.parse(message.value.toString());
        try {
          await callback(parsedMessage);
        } catch (error) {
          console.error(error);
        }
      },
    });
  }
}