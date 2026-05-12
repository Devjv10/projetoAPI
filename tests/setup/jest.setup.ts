import { products } from "../../src/data/products";
import { pedidos } from "../../src/data/pedidos";
import { processedEvents } from "../../src/data/processedEvents";
import { itensReadModel, pedidosReadModel } from "../../src/data/readModels";
import { publishedPedidoCriadoEvents } from "../../src/application/eventBus/InMemoryEventBus";
import { notificationLogs } from "../../src/application/consumers/PedidoCriadoConsumer";

beforeEach(() => {
  products.splice(0, products.length);
  pedidos.splice(0, pedidos.length);
  pedidosReadModel.splice(0, pedidosReadModel.length);
  itensReadModel.splice(0, itensReadModel.length);
  processedEvents.splice(0, processedEvents.length);
  publishedPedidoCriadoEvents.splice(0, publishedPedidoCriadoEvents.length);
  notificationLogs.splice(0, notificationLogs.length);
});
