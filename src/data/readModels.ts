export interface PedidoReadModel {
  pedidoId: string;
  clienteId: string;
  nomeCliente: string;
  emailCliente: string;
  status: string;
  valorTotal: number;
  criadoEm: string;
}

export interface ItemReadModel {
  pedidoId: string;
  produtoId: number;
  nomeProduto: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

export const pedidosReadModel: PedidoReadModel[] = [];
export const itensReadModel: ItemReadModel[] = [];
