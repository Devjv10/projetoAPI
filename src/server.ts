import { createServer } from "http";
import app from "./app";
import { startRabbitMqConsumers } from "./application/bootstrap";
import { logger } from "./infrastructure/logging/logger";
import { attachPedidoHub } from "./infrastructure/realtime/PedidoHub";

const PORT = Number(process.env.PORT) || 4000;
const server = createServer(app);

attachPedidoHub(server).catch((error) => {
  logger.warn("SignalR hub iniciado sem backplane Redis", {
    error: error instanceof Error ? error.message : "Erro desconhecido"
  });
});

server.listen(PORT, () => {
  logger.info("Servidor iniciado", {
    url: `http://localhost:${PORT}`,
    swaggerUrl: `http://localhost:${PORT}/api-docs`,
    signalRUrl: `ws://localhost:${PORT}/hubs/pedidos`
  });

  startRabbitMqConsumers().catch((error) => {
    logger.warn("RabbitMQ consumers nao iniciados", {
      error: error instanceof Error ? error.message : "Erro desconhecido"
    });
  });
});
