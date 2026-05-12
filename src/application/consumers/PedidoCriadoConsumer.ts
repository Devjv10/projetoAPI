import { PedidoCriadoEvent } from "../../domain/events/PedidoCriadoEvent";
import { markProcessed, wasProcessed } from "../../data/processedEvents";

export const notificationLogs: string[] = [];

export class PedidoCriadoConsumer {
  private readonly consumerName = "PedidoCriadoConsumer";

  async consume(event: PedidoCriadoEvent): Promise<void> {
    if (wasProcessed(this.consumerName, event.messageId)) {
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
    console.log(logMessage);

    markProcessed(this.consumerName, event.messageId);
  }
}
