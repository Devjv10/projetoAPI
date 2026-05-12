import { PedidoCriadoConsumer, notificationLogs } from "../../../src/application/consumers/PedidoCriadoConsumer";
import { PedidoProjector } from "../../../src/application/Projections/PedidoProjector";
import { itensReadModel, pedidosReadModel } from "../../../src/data/readModels";
import { PedidoCriadoEvent } from "../../../src/domain/events/PedidoCriadoEvent";

const makeEvent = (): PedidoCriadoEvent => ({
  messageId: "message-idempotente-1",
  pedidoId: "pedido-idempotente-1",
  clienteId: "cliente-1",
  nomeCliente: "Cliente Teste",
  emailCliente: "cliente@email.com",
  valorTotal: 50,
  criadoEm: new Date("2026-05-12T10:00:00.000Z").toISOString(),
  itens: [
    {
      produtoId: 1,
      nomeProduto: "Produto Teste",
      quantidade: 2,
      precoUnitario: 25
    }
  ]
});

describe("Idempotencia de eventos", () => {
  it("nao deve processar notificacao duplicada com o mesmo messageId", async () => {
    const consumer = new PedidoCriadoConsumer();
    const event = makeEvent();

    await consumer.consume(event);
    await consumer.consume(event);

    expect(notificationLogs).toHaveLength(1);
  });

  it("nao deve duplicar read model com o mesmo messageId", async () => {
    const projector = new PedidoProjector();
    const event = makeEvent();

    await projector.consume(event);
    await projector.consume(event);

    expect(pedidosReadModel).toHaveLength(1);
    expect(itensReadModel).toHaveLength(1);
  });
});
