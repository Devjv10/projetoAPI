import { PedidoStatusAlteradoEvent } from "../../domain/events/PedidoStatusAlteradoEvent";
import { logger } from "../logging/logger";
import { emitPedidoStatusAlterado } from "../realtime/PedidoHub";

export class PedidoStatusAlteradoConsumer {
  async consume(event: PedidoStatusAlteradoEvent): Promise<void> {
    logger.info("PedidoStatusAlterado recebido", {
      pedidoId: event.pedidoId,
      status: event.novoStatus,
      statusAnterior: event.statusAnterior,
      messageId: event.messageId
    });
    emitPedidoStatusAlterado(event);
  }
}
