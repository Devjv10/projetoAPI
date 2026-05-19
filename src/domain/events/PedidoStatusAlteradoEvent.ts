export interface PedidoStatusAlteradoEvent {
  messageId: string;
  pedidoId: string;
  statusAnterior: string;
  novoStatus: string;
  alteradoEm: string;
  observacao?: string;
}
