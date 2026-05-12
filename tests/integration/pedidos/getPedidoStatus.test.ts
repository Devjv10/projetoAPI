import request from "supertest";
import app from "../../../src/app";
import { seedProducts } from "../../helpers/productFactory";

describe("GET /api/v1/pedidos/:id/status", () => {
  it("deve retornar status final projetado para polling", async () => {
    seedProducts({
      id: 1,
      nome: "Teclado",
      descricao: "Teclado mecanico",
      preco: 300,
      estoque: 4
    });

    const created = await request(app)
      .post("/api/v1/pedidos")
      .send({
        clienteId: "cliente-status",
        nomeCliente: "Ana Costa",
        emailCliente: "ana@email.com",
        itens: [{ produtoId: 1, quantidade: 1 }]
      });

    const response = await request(app).get(`/api/v1/pedidos/${created.body.pedidoId}/status`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      pedidoId: created.body.pedidoId,
      status: "Confirmado"
    });
  });
});
