export interface ItemDetalheDto {
  nomeProduto: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

export interface PedidoDetalheDto {
  pedidoId: string;
  nomeCliente: string;
  emailCliente: string;
  status: string;
  valorTotal: number;
  criadoEm: string;
  criadoEmFormatado: string;
  itens: ItemDetalheDto[];
}

export interface PedidoResumoDto {
  pedidoId: string;
  nomeCliente: string;
  status: string;
  valorTotal: number;
  criadoEm: string;
}
