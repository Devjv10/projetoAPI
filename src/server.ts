import app from "./app";
import { startRabbitMqConsumers } from "./application/bootstrap";

const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Swagger disponivel em http://localhost:${PORT}/api-docs`);

  startRabbitMqConsumers().catch((error) => {
    console.warn(
      error instanceof Error
        ? `RabbitMQ consumers nao iniciados: ${error.message}`
        : "RabbitMQ consumers nao iniciados."
    );
  });
});
