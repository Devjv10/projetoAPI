import { createRequire } from "module";
import { PedidoCriadoEvent } from "../../domain/events/PedidoCriadoEvent";

const dynamicRequire = createRequire(__filename);

interface AmqpChannel {
  assertExchange(exchange: string, type: string, options: { durable: boolean }): Promise<void>;
  publish(
    exchange: string,
    routingKey: string,
    content: Buffer,
    options: { persistent: boolean; messageId: string; contentType: string }
  ): boolean;
  close(): Promise<void>;
}

interface AmqpConnection {
  createChannel(): Promise<AmqpChannel>;
  close(): Promise<void>;
}

interface AmqpModule {
  connect(url: string): Promise<AmqpConnection>;
}

export class RabbitMqPublisher {
  private readonly url = process.env.RABBITMQ_URL || "amqp://guest:guest@rabbitmq:5672";
  private readonly exchange = process.env.RABBITMQ_EXCHANGE || "gestao-pedidos";

  async publishPedidoCriado(event: PedidoCriadoEvent): Promise<void> {
    const amqp = this.loadAmqp();

    if (!amqp) {
      return;
    }

    const connection = await amqp.connect(this.url);
    const channel = await connection.createChannel();

    try {
      await channel.assertExchange(this.exchange, "topic", { durable: true });
      channel.publish(
        this.exchange,
        "pedido.criado",
        Buffer.from(JSON.stringify(event)),
        {
          persistent: true,
          messageId: event.messageId,
          contentType: "application/json"
        }
      );
    } finally {
      await channel.close();
      await connection.close();
    }
  }

  private loadAmqp(): AmqpModule | null {
    try {
      return dynamicRequire("amqplib") as AmqpModule;
    } catch {
      return null;
    }
  }
}
