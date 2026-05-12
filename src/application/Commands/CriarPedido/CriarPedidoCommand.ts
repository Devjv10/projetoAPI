export interface CriarPedidoCommandItem {
  produtoId: number;
  quantidade: number;
}

export interface CriarPedidoCommand {
  clienteId: string;
  nomeCliente: string;
  emailCliente: string;
  itens: CriarPedidoCommandItem[];
}
