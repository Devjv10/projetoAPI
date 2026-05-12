import request from "supertest";
import app from "../../../src/app";
import { seedProducts } from "../../helpers/productFactory";

describe("GET /api/v1/pedidos/:id", () => {
  it("deve retornar pedido pelo read model", async () => {
    seedProducts({
      id: 1,
      nome: "Mouse",
      descricao: "Mouse sem fio",
      preco: 120,
      estoque: 10
    });

    const created = await request(app)
      .post("/api/v1/pedidos")
      .send({
        clienteId: "cliente-2",
        nomeCliente: "Joao Souza",
        emailCliente: "joao@email.com",
        itens: [{ produtoId: 1, quantidade: 1 }]
      });

    const response = await request(app).get(`/api/v1/pedidos/${created.body.pedidoId}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      pedidoId: created.body.pedidoId,
      nomeCliente: "Joao Souza",
      emailCliente: "joao@email.com",
      status: "Confirmado",
      valorTotal: 120
    });
    expect(response.body.criadoEmFormatado).toEqual(expect.any(String));
    expect(response.body.itens).toEqual([
      {
        nomeProduto: "Mouse",
        quantidade: 1,
        precoUnitario: 120,
        subtotal: 120
      }
    ]);
  });
});
