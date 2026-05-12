import { createRequire } from "module";
import { PedidoCriadoEvent } from "../../domain/events/PedidoCriadoEvent";
import { PedidoCriadoHandler } from "./EventBus";

const dynamicRequire = createRequire(__filename);

interface AmqpMessage {
  content: Buffer;
}

interface AmqpChannel {
  assertExchange(exchange: string, type: string, options: { durable: boolean }): Promise<void>;
  assertQueue(queue: string, options: { durable: boolean }): Promise<void>;
  bindQueue(queue: string, exchange: string, routingKey: string): Promise<void>;
  consume(queue: string, handler: (message: AmqpMessage | null) => void): Promise<unknown>;
  ack(message: AmqpMessage): void;
  nack(message: AmqpMessage, allUpTo?: boolean, requeue?: boolean): void;
}

interface AmqpConnection {
  createChannel(): Promise<AmqpChannel>;
}

interface AmqpModule {
  connect(url: string): Promise<AmqpConnection>;
}

interface RabbitMqSubscription {
  queue: string;
  handler: PedidoCriadoHandler;
}

export class RabbitMqConsumerHost {
  private readonly url = process.env.RABBITMQ_URL || "amqp://guest:guest@rabbitmq:5672";
  private readonly exchange = process.env.RABBITMQ_EXCHANGE || "gestao-pedidos";
  private started = false;

  async startPedidoCriadoConsumers(subscriptions: RabbitMqSubscription[]): Promise<void> {
    if (this.started || process.env.NODE_ENV === "test") {
      return;
    }

    const amqp = this.loadAmqp();

    if (!amqp) {
      return;
    }

    const connection = await amqp.connect(this.url);
    const channel = await connection.createChannel();

    await channel.assertExchange(this.exchange, "topic", { durable: true });

    for (const subscription of subscriptions) {
      await channel.assertQueue(subscription.queue, { durable: true });
      await channel.bindQueue(subscription.queue, this.exchange, "pedido.criado");
      await channel.consume(subscription.queue, async (message) => {
        if (!message) {
          return;
        }

        try {
          const event = JSON.parse(message.content.toString()) as PedidoCriadoEvent;
          await subscription.handler(event);
          channel.ack(message);
        } catch (error) {
          console.error(
            error instanceof Error
              ? `Falha ao consumir mensagem RabbitMQ: ${error.message}`
              : "Falha ao consumir mensagem RabbitMQ."
          );
          channel.nack(message, false, true);
        }
      });
    }

    this.started = true;
  }

  private loadAmqp(): AmqpModule | null {
    try {
      return dynamicRequire("amqplib") as AmqpModule;
    } catch {
      return null;
    }
  }
}
