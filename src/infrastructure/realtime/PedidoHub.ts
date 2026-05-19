import { Server as HttpServer } from "http";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import { Server } from "socket.io";
import { PedidoStatusAlteradoEvent } from "../../domain/events/PedidoStatusAlteradoEvent";

let io: Server | null = null;

export const grupoKey = (pedidoId: string): string => `pedido:${pedidoId}`;

export const attachPedidoHub = async (server: HttpServer): Promise<Server> => {
  io = new Server(server, {
    path: "/hubs/pedidos",
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:4200",
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    console.log(`SignalR conectado socketId=${socket.id}`);

    socket.on("AssinarPedido", async (pedidoId: string, ack?: (response: { ok: boolean }) => void) => {
      await socket.join(grupoKey(pedidoId));
      console.log(`SignalR grupo assinado socketId=${socket.id} pedidoId=${pedidoId}`);
      ack?.({ ok: true });
    });

    socket.on("SairDoPedido", async (pedidoId: string, ack?: (response: { ok: boolean }) => void) => {
      await socket.leave(grupoKey(pedidoId));
      console.log(`SignalR grupo removido socketId=${socket.id} pedidoId=${pedidoId}`);
      ack?.({ ok: true });
    });
  });

  await configureRedisBackplane(io);
  return io;
};

export const emitPedidoStatusAlterado = (event: PedidoStatusAlteradoEvent): void => {
  io?.to(grupoKey(event.pedidoId)).emit("StatusAtualizado", {
    pedidoId: event.pedidoId,
    statusAnterior: event.statusAnterior,
    novoStatus: event.novoStatus,
    alteradoEm: event.alteradoEm,
    observacao: event.observacao
  });
};

const configureRedisBackplane = async (server: Server): Promise<void> => {
  if (process.env.NODE_ENV === "test") {
    return;
  }

  const password = process.env.REDIS_PASSWORD;
  const url = process.env.REDIS_URL || (password ? `redis://:${password}@redis:6379` : "redis://redis:6379");

  try {
    const pubClient = createClient({ url });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);
    server.adapter(createAdapter(pubClient, subClient, { key: "GestaoPedidos:signalr" }));
  } catch (error) {
    console.warn(
      error instanceof Error
        ? `SignalR Redis backplane indisponivel: ${error.message}`
        : "SignalR Redis backplane indisponivel."
    );
  }
};
