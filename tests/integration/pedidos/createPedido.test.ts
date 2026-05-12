import request from "supertest";
import app from "../../../src/app";
import { publishedPedidoCriadoEvents } from "../../../src/application/eventBus/InMemoryEventBus";
import { notificationLogs } from "../../../src/application/consumers/PedidoCriadoConsumer";
import { pedidosReadModel, itensReadModel } from "../../../src/data/readModels";
import { seedProducts } from "../../helpers/productFactory";

describe("POST /api/v1/pedidos", () => {
  it("deve criar pedido, publicar evento, consumir notificacao e atualizar read model", async () => {
    seedProducts({
      id: 1,
      nome: "Notebook Gamer",
      descricao: "Notebook com 16GB de RAM",
      preco: 5000,
      estoque: 3
    });

    const response = await request(app)
      .post("/api/v1/pedidos")
      .send({
        clienteId: "cliente-1",
        nomeCliente: "Maria Silva",
        emailCliente: "maria@email.com",
        itens: [{ produtoId: 1, quantidade: 2 }]
      });

    expect(response.status).toBe(201);
    expect(response.body.pedidoId).toEqual(expect.any(String));
    expect(Object.keys(response.body)).toEqual(["pedidoId"]);

    expect(publishedPedidoCriadoEvents).toHaveLength(1);
    expect(publishedPedidoCriadoEvents[0]).toMatchObject({
      pedidoId: response.body.pedidoId,
      clienteId: "cliente-1",
      nomeCliente: "Maria Silva",
      emailCliente: "maria@email.com",
      valorTotal: 10000
    });

    expect(notificationLogs[0]).toContain("email=maria@email.com");
    expect(notificationLogs[0]).toContain(`pedidoId=${response.body.pedidoId}`);

    expect(pedidosReadModel).toContainEqual(
      expect.objectContaining({
        pedidoId: response.body.pedidoId,
        status: "Confirmado",
        valorTotal: 10000
      })
    );
    expect(itensReadModel).toContainEqual(
      expect.objectContaining({
        pedidoId: response.body.pedidoId,
        nomeProduto: "Notebook Gamer",
        subtotal: 10000
      })
    );
  });
});
