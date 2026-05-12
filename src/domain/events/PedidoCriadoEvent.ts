export interface PedidoCriadoEventItem {
  produtoId: number;
  nomeProduto: string;
  quantidade: number;
  precoUnitario: number;
}

export interface PedidoCriadoEvent {
  messageId: string;
  pedidoId: string;
  clienteId: string;
  nomeCliente: string;
  emailCliente: string;
  valorTotal: number;
  criadoEm: string;
  itens: PedidoCriadoEventItem[];
}
