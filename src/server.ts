import { createServer } from "http";
import app from "./app";
import { startRabbitMqConsumers } from "./application/bootstrap";
import { attachPedidoHub } from "./infrastructure/realtime/PedidoHub";

const PORT = Number(process.env.PORT) || 4000;
const server = createServer(app);

attachPedidoHub(server).catch((error) => {
  console.warn(
    error instanceof Error
      ? `SignalR hub iniciado sem backplane Redis: ${error.message}`
      : "SignalR hub iniciado sem backplane Redis."
  );
});

server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Swagger disponivel em http://localhost:${PORT}/api-docs`);
  console.log(`SignalR disponivel em ws://localhost:${PORT}/hubs/pedidos`);

  startRabbitMqConsumers().catch((error) => {
    console.warn(
      error instanceof Error
        ? `RabbitMQ consumers nao iniciados: ${error.message}`
        : "RabbitMQ consumers nao iniciados."
    );
  });
});
