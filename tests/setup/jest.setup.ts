import { products } from "../../src/data/products";
import { pedidos } from "../../src/data/pedidos";
import { processedEvents } from "../../src/data/processedEvents";
import { itensReadModel, pedidosReadModel } from "../../src/data/readModels";
import {
  publishedPedidoCriadoEvents,
  publishedPedidoStatusAlteradoEvents
} from "../../src/application/eventBus/InMemoryEventBus";
import { notificationLogs } from "../../src/application/consumers/PedidoCriadoConsumer";
import { cacheClient } from "../../src/infrastructure/cache/RedisClient";

beforeEach(async () => {
  products.splice(0, products.length);
  pedidos.splice(0, pedidos.length);
  pedidosReadModel.splice(0, pedidosReadModel.length);
  itensReadModel.splice(0, itensReadModel.length);
  processedEvents.splice(0, processedEvents.length);
  publishedPedidoCriadoEvents.splice(0, publishedPedidoCriadoEvents.length);
  publishedPedidoStatusAlteradoEvents.splice(0, publishedPedidoStatusAlteradoEvents.length);
  notificationLogs.splice(0, notificationLogs.length);

  const keys = await cacheClient.keys("GestaoPedidos:*");
  await Promise.all(keys.map((key) => cacheClient.del(key)));
});
