import { PedidoCriadoEvent } from "../../domain/events/PedidoCriadoEvent";
import { EventBus, PedidoCriadoHandler } from "./EventBus";
import { RabbitMqPublisher } from "./RabbitMqPublisher";

export const publishedPedidoCriadoEvents: PedidoCriadoEvent[] = [];

export class InMemoryEventBus implements EventBus {
  private readonly handlers: PedidoCriadoHandler[] = [];
  private readonly rabbitMqPublisher = new RabbitMqPublisher();

  subscribePedidoCriado(handler: PedidoCriadoHandler): void {
    this.handlers.push(handler);
  }

  async publishPedidoCriado(event: PedidoCriadoEvent): Promise<void> {
    publishedPedidoCriadoEvents.push(event);

    try {
      await this.rabbitMqPublisher.publishPedidoCriado(event);
    } catch (error) {
      if (process.env.NODE_ENV !== "test") {
        console.warn(
          error instanceof Error
            ? `Falha ao publicar no RabbitMQ: ${error.message}`
            : "Falha ao publicar no RabbitMQ."
        );
      }
    }

    await Promise.all(this.handlers.map((handler) => handler(event)));
  }
}

export const eventBus = new InMemoryEventBus();
