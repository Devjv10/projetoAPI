import { PedidoStatusAlteradoEvent } from "../../domain/events/PedidoStatusAlteradoEvent";
import { emitPedidoStatusAlterado } from "../realtime/PedidoHub";

export class PedidoStatusAlteradoConsumer {
  async consume(event: PedidoStatusAlteradoEvent): Promise<void> {
    console.log(`PedidoStatusAlterado recebido pedidoId=${event.pedidoId} novoStatus=${event.novoStatus}`);
    emitPedidoStatusAlterado(event);
  }
}
