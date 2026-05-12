import { pedidos } from "../../../data/pedidos";
import { pedidosReadModel } from "../../../data/readModels";

export class ObterPedidoStatusHandler {
  async handle(pedidoId: string): Promise<{ pedidoId: string; status: string } | null> {
    const readModel = pedidosReadModel.find((item) => item.pedidoId === pedidoId);

    if (readModel) {
      return {
        pedidoId,
        status: readModel.status
      };
    }

    const pedido = pedidos.find((item) => item.id === pedidoId);

    if (!pedido) {
      return null;
    }

    return {
      pedidoId,
      status: pedido.status
    };
  }
}
