import { PedidoCriadoConsumer } from "./consumers/PedidoCriadoConsumer";
import { eventBus } from "./eventBus/InMemoryEventBus";
import { RabbitMqConsumerHost } from "./eventBus/RabbitMqConsumerHost";
import { PedidoProjector } from "./Projections/PedidoProjector";
import { PedidoStatusAlteradoConsumer } from "../infrastructure/consumers/PedidoStatusAlteradoConsumer";

const notificationConsumer = new PedidoCriadoConsumer();
const pedidoProjector = new PedidoProjector();
const rabbitMqConsumerHost = new RabbitMqConsumerHost();
const pedidoStatusAlteradoConsumer = new PedidoStatusAlteradoConsumer();

let configured = false;

export const configureApplication = (): void => {
  if (configured) {
    return;
  }

  eventBus.subscribePedidoCriado((event) => notificationConsumer.consume(event));
  eventBus.subscribePedidoCriado((event) => pedidoProjector.consume(event));
  eventBus.subscribePedidoStatusAlterado((event) => pedidoStatusAlteradoConsumer.consume(event));
  configured = true;
};

export const startRabbitMqConsumers = async (): Promise<void> => {
  await rabbitMqConsumerHost.startPedidoCriadoConsumers([
    {
      queue: "gestao-pedidos.notificacoes.pedido-criado",
      handler: (event) => notificationConsumer.consume(event)
    },
    {
      queue: "gestao-pedidos.projections.pedido-criado",
      handler: (event) => pedidoProjector.consume(event)
    }
  ]);
  await rabbitMqConsumerHost.startPedidoStatusAlteradoConsumers([
    {
      queue: "gestao-pedidos.signalr.pedido-status-alterado",
      handler: (event) => pedidoStatusAlteradoConsumer.consume(event)
    }
  ]);
};
