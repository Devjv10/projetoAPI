import { AtualizarStatusPedidoCommandHandler } from "../../../src/application/Commands/AtualizarStatusPedido/AtualizarStatusPedidoCommandHandler";
import { CriarPedidoCommandHandler } from "../../../src/application/Commands/CriarPedido/CriarPedidoCommandHandler";
import { EventBus } from "../../../src/application/eventBus/EventBus";
import { pedidos } from "../../../src/data/pedidos";
import { seedProducts } from "../../helpers/productFactory";

const eventBusStub: EventBus = {
  subscribePedidoCriado: jest.fn(),
  subscribePedidoStatusAlterado: jest.fn(),
  publishPedidoCriado: jest.fn().mockResolvedValue(undefined),
  publishPedidoStatusAlterado: jest.fn().mockResolvedValue(undefined)
};

describe("Dominio de pedidos", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve iniciar pedido criado como Pendente", async () => {
    seedProducts({ id: 1, nome: "Mouse", descricao: "Mouse sem fio", preco: 100, estoque: 5 });

    const pedidoId = await new CriarPedidoCommandHandler(eventBusStub).handle({
      clienteId: "cliente-1",
      nomeCliente: "Ana",
      emailCliente: "ana@email.com",
      itens: [{ produtoId: 1, quantidade: 1 }]
    });

    expect(pedidos.find((pedido) => pedido.id === pedidoId)?.status).toBe("Pendente");
  });

  it("deve cancelar pedido pendente", async () => {
    seedProducts({ id: 1, nome: "Mouse", descricao: "Mouse sem fio", preco: 100, estoque: 5 });
    const criarPedidoHandler = new CriarPedidoCommandHandler(eventBusStub);
    const atualizarStatusHandler = new AtualizarStatusPedidoCommandHandler(eventBusStub);
    const pedidoId = await criarPedidoHandler.handle({
      clienteId: "cliente-1",
      nomeCliente: "Ana",
      emailCliente: "ana@email.com",
      itens: [{ produtoId: 1, quantidade: 1 }]
    });

    await atualizarStatusHandler.handle({ pedidoId, novoStatus: "Cancelado" });

    expect(pedidos.find((pedido) => pedido.id === pedidoId)?.status).toBe("Cancelado");
  });

  it("deve impedir cancelamento de pedido entregue", async () => {
    seedProducts({ id: 1, nome: "Mouse", descricao: "Mouse sem fio", preco: 100, estoque: 5 });
    const criarPedidoHandler = new CriarPedidoCommandHandler(eventBusStub);
    const atualizarStatusHandler = new AtualizarStatusPedidoCommandHandler(eventBusStub);
    const pedidoId = await criarPedidoHandler.handle({
      clienteId: "cliente-1",
      nomeCliente: "Ana",
      emailCliente: "ana@email.com",
      itens: [{ produtoId: 1, quantidade: 1 }]
    });

    await atualizarStatusHandler.handle({ pedidoId, novoStatus: "Entregue" });

    await expect(
      atualizarStatusHandler.handle({ pedidoId, novoStatus: "Cancelado" })
    ).rejects.toThrow("Pedido entregue nao pode ser cancelado.");
  });

  it("deve calcular o total ao adicionar itens", async () => {
    seedProducts(
      { id: 1, nome: "Mouse", descricao: "Mouse sem fio", preco: 100, estoque: 5 },
      { id: 2, nome: "Teclado", descricao: "Teclado mecanico", preco: 250, estoque: 5 }
    );

    const pedidoId = await new CriarPedidoCommandHandler(eventBusStub).handle({
      clienteId: "cliente-1",
      nomeCliente: "Ana",
      emailCliente: "ana@email.com",
      itens: [
        { produtoId: 1, quantidade: 2 },
        { produtoId: 2, quantidade: 1 }
      ]
    });

    expect(pedidos.find((pedido) => pedido.id === pedidoId)?.valorTotal).toBe(450);
  });

  it("deve validar itens de dominio invalidos", async () => {
    seedProducts({ id: 1, nome: "Mouse", descricao: "Mouse sem fio", preco: 100, estoque: 5 });

    await expect(
      new CriarPedidoCommandHandler(eventBusStub).handle({
        clienteId: "cliente-1",
        nomeCliente: "Ana",
        emailCliente: "ana@email.com",
        itens: [{ produtoId: 1, quantidade: 0 }]
      })
    ).rejects.toThrow("Itens do pedido invalidos.");
  });
});
