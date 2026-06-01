import { randomUUID } from "crypto";
import { products } from "../../../data/products";
import { pedidos } from "../../../data/pedidos";
import { Pedido } from "../../../models/Pedido";
import { logger } from "../../../infrastructure/logging/logger";
import { metricasPedido } from "../../Metrics/MetricasPedido";
import { EventBus } from "../../eventBus/EventBus";
import { CriarPedidoCommand } from "./CriarPedidoCommand";

export class CriarPedidoCommandHandler {
  constructor(private readonly eventBus: EventBus) {}

  async handle(command: CriarPedidoCommand, correlationId?: string): Promise<string> {
    const endTimer = metricasPedido.pedidoCriacaoDuracaoSegundos.startTimer();

    this.validate(command);

    const pedidoId = randomUUID();
    const criadoEm = new Date().toISOString();

    const itens = command.itens.map((item) => {
      const produto = products.find((current) => current.id === item.produtoId);

      if (!produto) {
        throw new Error(`Produto ${item.produtoId} nao encontrado.`);
      }

      if (produto.estoque < item.quantidade) {
        throw new Error(`Estoque insuficiente para o produto ${produto.nome}.`);
      }

      return {
        produtoId: produto.id,
        nomeProduto: produto.nome,
        quantidade: item.quantidade,
        precoUnitario: produto.preco
      };
    });

    for (const item of command.itens) {
      const produto = products.find((current) => current.id === item.produtoId);

      if (produto) {
        produto.estoque -= item.quantidade;
      }
    }

    const valorTotal = itens.reduce(
      (total, item) => total + item.quantidade * item.precoUnitario,
      0
    );

    const pedido: Pedido = {
      id: pedidoId,
      clienteId: command.clienteId,
      nomeCliente: command.nomeCliente,
      emailCliente: command.emailCliente,
      status: "Pendente",
      valorTotal,
      criadoEm,
      itens
    };

    pedidos.push(pedido);

    await this.eventBus.publishPedidoCriado({
      messageId: randomUUID(),
      pedidoId,
      clienteId: command.clienteId,
      nomeCliente: command.nomeCliente,
      emailCliente: command.emailCliente,
      valorTotal,
      criadoEm,
      itens
    });

    metricasPedido.pedidosCriadosTotal.inc();
    metricasPedido.pedidosAtivos.inc();
    endTimer();

    logger.info("Pedido criado", {
      correlationId,
      pedidoId,
      userId: command.clienteId,
      valorTotal,
      status: pedido.status
    });

    return pedidoId;
  }

  private validate(command: CriarPedidoCommand): void {
    if (
      !command.clienteId ||
      !command.nomeCliente ||
      !command.emailCliente ||
      !Array.isArray(command.itens) ||
      command.itens.length === 0
    ) {
      throw new Error("Dados invalidos para criacao do pedido.");
    }

    for (const item of command.itens) {
      if (!Number.isInteger(item.produtoId) || item.quantidade <= 0) {
        throw new Error("Itens do pedido invalidos.");
      }
    }
  }
}
