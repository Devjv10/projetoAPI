import { PedidoStatus } from "../../../models/Pedido";

export interface AtualizarStatusPedidoCommand {
  pedidoId: string;
  novoStatus: PedidoStatus;
  observacao?: string;
}
