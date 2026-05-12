import { itensReadModel, pedidosReadModel } from "../../../data/readModels";
import { PedidoDetalheDto } from "../../DTOs/PedidoDtos";
import { ObterPedidoPorIdQuery } from "./ObterPedidoPorIdQuery";

export class ObterPedidoPorIdHandler {
  async handle(query: ObterPedidoPorIdQuery): Promise<PedidoDetalheDto | null> {
    const pedido = pedidosReadModel.find((item) => item.pedidoId === query.pedidoId);

    if (!pedido) {
      return null;
    }

    const criadoEm = new Date(pedido.criadoEm);

    return {
      pedidoId: pedido.pedidoId,
      nomeCliente: pedido.nomeCliente,
      emailCliente: pedido.emailCliente,
      status: pedido.status,
      valorTotal: pedido.valorTotal,
      criadoEm: pedido.criadoEm,
      criadoEmFormatado: criadoEm.toLocaleString("pt-BR"),
      itens: itensReadModel
        .filter((item) => item.pedidoId === query.pedidoId)
        .map((item) => ({
          nomeProduto: item.nomeProduto,
          quantidade: item.quantidade,
          precoUnitario: item.precoUnitario,
          subtotal: item.subtotal
        }))
    };
  }
}
