import { randomUUID } from "crypto";
import { pedidos } from "../../../data/pedidos";
import { pedidosReadModel } from "../../../data/readModels";
import { PedidoStatus } from "../../../models/Pedido";
import { PedidoCacheService } from "../../../infrastructure/cache/PedidoCacheService";
import { logger } from "../../../infrastructure/logging/logger";
import { EventBus } from "../../eventBus/EventBus";
import { AtualizarStatusPedidoCommand } from "./AtualizarStatusPedidoCommand";

const validStatuses: PedidoStatus[] = ["Criado", "Confirmado", "Cancelado"];

export class AtualizarStatusPedidoCommandHandler {
  constructor(
    private readonly eventBus: EventBus,
    private readonly pedidoCacheService = new PedidoCacheService()
  ) {}

  async handle(command: AtualizarStatusPedidoCommand, correlationId?: string): Promise<void> {
    if (!validStatuses.includes(command.novoStatus)) {
      throw new Error("Status de pedido invalido.");
    }

    const pedido = pedidos.find((current) => current.id === command.pedidoId);

    if (!pedido) {
      throw new Error("Pedido nao encontrado.");
    }

    const statusAnterior = pedido.status;
    const alteradoEm = new Date().toISOString();

    pedido.status = command.novoStatus;

    const readModel = pedidosReadModel.find((current) => current.pedidoId === command.pedidoId);
    if (readModel) {
      readModel.status = command.novoStatus;
    }

    await this.pedidoCacheService.invalidateAsync(`pedido:item:${command.pedidoId}`);
    await this.pedidoCacheService.invalidateAsync(`pedido:status:${command.pedidoId}`);

    await this.eventBus.publishPedidoStatusAlterado({
      messageId: randomUUID(),
      pedidoId: command.pedidoId,
      statusAnterior,
      novoStatus: command.novoStatus,
      alteradoEm,
      observacao: command.observacao
    });

    logger.info("Status do pedido atualizado", {
      correlationId,
      pedidoId: command.pedidoId,
      userId: pedido.clienteId,
      valorTotal: pedido.valorTotal,
      status: command.novoStatus,
      statusAnterior
    });
  }
}
