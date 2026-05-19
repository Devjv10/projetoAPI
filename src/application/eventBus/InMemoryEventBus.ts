import { PedidoCriadoEvent } from "../../domain/events/PedidoCriadoEvent";
import { PedidoStatusAlteradoEvent } from "../../domain/events/PedidoStatusAlteradoEvent";
import { EventBus, PedidoCriadoHandler, PedidoStatusAlteradoHandler } from "./EventBus";
import { RabbitMqPublisher } from "./RabbitMqPublisher";

export const publishedPedidoCriadoEvents: PedidoCriadoEvent[] = [];
export const publishedPedidoStatusAlteradoEvents: PedidoStatusAlteradoEvent[] = [];

export class InMemoryEventBus implements EventBus {
  private readonly handlers: PedidoCriadoHandler[] = [];
  private readonly statusHandlers: PedidoStatusAlteradoHandler[] = [];
  private readonly rabbitMqPublisher = new RabbitMqPublisher();

  subscribePedidoCriado(handler: PedidoCriadoHandler): void {
    this.handlers.push(handler);
  }

  subscribePedidoStatusAlterado(handler: PedidoStatusAlteradoHandler): void {
    this.statusHandlers.push(handler);
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

  async publishPedidoStatusAlterado(event: PedidoStatusAlteradoEvent): Promise<void> {
    publishedPedidoStatusAlteradoEvents.push(event);

    try {
      await this.rabbitMqPublisher.publishPedidoStatusAlterado(event);
    } catch (error) {
      if (process.env.NODE_ENV !== "test") {
        console.warn(
          error instanceof Error
            ? `Falha ao publicar status no RabbitMQ: ${error.message}`
            : "Falha ao publicar status no RabbitMQ."
        );
      }
    }

    await Promise.all(this.statusHandlers.map((handler) => handler(event)));
  }
}

export const eventBus = new InMemoryEventBus();
