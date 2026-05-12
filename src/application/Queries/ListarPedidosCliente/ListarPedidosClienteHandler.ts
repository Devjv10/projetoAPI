import { pedidosReadModel } from "../../../data/readModels";
import { PedidoResumoDto } from "../../DTOs/PedidoDtos";
import { ListarPedidosClienteQuery } from "./ListarPedidosClienteQuery";

export class ListarPedidosClienteHandler {
  async handle(query: ListarPedidosClienteQuery): Promise<PedidoResumoDto[]> {
    return pedidosReadModel
      .filter((pedido) => pedido.clienteId === query.clienteId)
      .map((pedido) => ({
        pedidoId: pedido.pedidoId,
        nomeCliente: pedido.nomeCliente,
        status: pedido.status,
        valorTotal: pedido.valorTotal,
        criadoEm: pedido.criadoEm
      }));
  }
}
