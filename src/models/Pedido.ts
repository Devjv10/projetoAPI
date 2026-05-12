export type PedidoStatus = "Criado" | "Confirmado" | "Cancelado";

export interface PedidoItem {
  produtoId: number;
  nomeProduto: string;
  quantidade: number;
  precoUnitario: number;
}

export interface Pedido {
  id: string;
  clienteId: string;
  nomeCliente: string;
  emailCliente: string;
  status: PedidoStatus;
  valorTotal: number;
  criadoEm: string;
  itens: PedidoItem[];
}
