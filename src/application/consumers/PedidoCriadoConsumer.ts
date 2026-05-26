import { PedidoCriadoEvent } from "../../domain/events/PedidoCriadoEvent";
import { markProcessed, wasProcessed } from "../../data/processedEvents";
import { logger } from "../../infrastructure/logging/logger";

export const notificationLogs: string[] = [];

export class PedidoCriadoConsumer {
  private readonly consumerName = "PedidoCriadoConsumer";

  async consume(event: PedidoCriadoEvent): Promise<void> {
    if (wasProcessed(this.consumerName, event.messageId)) {
      logger.info("Evento PedidoCriado ignorado por idempotencia", {
        pedidoId: event.pedidoId,
        userId: event.clienteId,
        valorTotal: event.valorTotal,
        messageId: event.messageId
      });
      return;
    }

    const logMessage = [
      "Email simulado",
      `cliente=${event.nomeCliente}`,
      `email=${event.emailCliente}`,
      `pedidoId=${event.pedidoId}`,
      `valorTotal=${event.valorTotal.toFixed(2)}`
    ].join(" | ");

    notificationLogs.push(logMessage);
    logger.info("Email simulado para pedido criado", {
      pedidoId: event.pedidoId,
      userId: event.clienteId,
      valorTotal: event.valorTotal,
      status: "Criado",
      emailCliente: event.emailCliente,
      messageId: event.messageId
    });

    markProcessed(this.consumerName, event.messageId);
  }
}
