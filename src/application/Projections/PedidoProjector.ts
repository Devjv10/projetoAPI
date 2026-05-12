import { itensReadModel, pedidosReadModel } from "../../data/readModels";
import { markProcessed, wasProcessed } from "../../data/processedEvents";
import { PedidoCriadoEvent } from "../../domain/events/PedidoCriadoEvent";

export class PedidoProjector {
  private readonly consumerName = "PedidoProjector";

  async consume(event: PedidoCriadoEvent): Promise<void> {
    if (wasProcessed(this.consumerName, event.messageId)) {
      return;
    }

    pedidosReadModel.push({
      pedidoId: event.pedidoId,
      clienteId: event.clienteId,
      nomeCliente: event.nomeCliente,
      emailCliente: event.emailCliente,
      status: "Confirmado",
      valorTotal: event.valorTotal,
      criadoEm: event.criadoEm
    });

    for (const item of event.itens) {
      itensReadModel.push({
        pedidoId: event.pedidoId,
        produtoId: item.produtoId,
        nomeProduto: item.nomeProduto,
        quantidade: item.quantidade,
        precoUnitario: item.precoUnitario,
        subtotal: item.quantidade * item.precoUnitario
      });
    }

    markProcessed(this.consumerName, event.messageId);
  }
}
