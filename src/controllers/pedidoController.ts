import { Request, Response } from "express";
import { CriarPedidoCommandHandler } from "../application/Commands/CriarPedido/CriarPedidoCommandHandler";
import { ListarPedidosClienteHandler } from "../application/Queries/ListarPedidosCliente/ListarPedidosClienteHandler";
import { ObterPedidoPorIdHandler } from "../application/Queries/ObterPedidoPorId/ObterPedidoPorIdHandler";
import { ObterPedidoStatusHandler } from "../application/Queries/ObterPedidoStatus/ObterPedidoStatusHandler";
import { eventBus } from "../application/eventBus/InMemoryEventBus";

const criarPedidoHandler = new CriarPedidoCommandHandler(eventBus);
const obterPedidoPorIdHandler = new ObterPedidoPorIdHandler();
const listarPedidosClienteHandler = new ListarPedidosClienteHandler();
const obterPedidoStatusHandler = new ObterPedidoStatusHandler();

export const criarPedido = async (req: Request, res: Response): Promise<void> => {
  try {
    const pedidoId = await criarPedidoHandler.handle(req.body);
    res.status(201).json({ pedidoId });
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Nao foi possivel criar o pedido."
    });
  }
};

export const obterPedidoPorId = async (req: Request, res: Response): Promise<void> => {
  const pedido = await obterPedidoPorIdHandler.handle({ pedidoId: String(req.params.id) });

  if (!pedido) {
    res.status(404).json({ message: "Pedido nao encontrado no read model." });
    return;
  }

  res.status(200).json(pedido);
};

export const listarPedidosCliente = async (req: Request, res: Response): Promise<void> => {
  const pedidos = await listarPedidosClienteHandler.handle({
    clienteId: String(req.query.clienteId || "")
  });

  res.status(200).json(pedidos);
};

export const obterStatusPedido = async (req: Request, res: Response): Promise<void> => {
  const status = await obterPedidoStatusHandler.handle(String(req.params.id));

  if (!status) {
    res.status(404).json({ message: "Pedido nao encontrado." });
    return;
  }

  res.status(200).json(status);
};
