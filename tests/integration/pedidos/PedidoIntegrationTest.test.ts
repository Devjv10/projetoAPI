import request from "supertest";
import app from "../../../src/app";
import { seedProducts } from "../../helpers/productFactory";

describe("PedidoIntegrationTest", () => {
  it("deve chamar POST /api/v1/pedidos e validar status projetado", async () => {
    seedProducts({
      id: 1,
      nome: "Notebook",
      descricao: "Notebook corporativo",
      preco: 3000,
      estoque: 3
    });

    const created = await request(app)
      .post("/api/v1/pedidos")
      .send({
        clienteId: "cliente-1",
        nomeCliente: "Maria Silva",
        emailCliente: "maria@email.com",
        itens: [{ produtoId: 1, quantidade: 1 }]
      });

    expect(created.status).toBe(201);

    const status = await request(app).get(`/api/v1/pedidos/${created.body.pedidoId}/status`);

    expect(status.status).toBe(200);
    expect(status.body).toEqual({
      pedidoId: created.body.pedidoId,
      status: "Confirmado"
    });
  });

  const describeWithSqlServer =
    process.env.RUN_TESTCONTAINERS === "true" ? describe : describe.skip;

  describeWithSqlServer("Testcontainers SQL Server", () => {
    let container: { stop(): Promise<unknown> } | null = null;

    afterEach(async () => {
      await container?.stop();
      container = null;
    });

    it("deve subir SQL Server isolado e criar pedido via API", async () => {
      const { GenericContainer, Wait } = await import("testcontainers");

      container = await new GenericContainer("mcr.microsoft.com/mssql/server:2022-latest")
        .withEnvironment({
          ACCEPT_EULA: "Y",
          SA_PASSWORD: "GestaoPedidos@2025!"
        })
        .withExposedPorts(1433)
        .withWaitStrategy(Wait.forLogMessage(/SQL Server is now ready/))
        .withStartupTimeout(120_000)
        .start();

      seedProducts({
        id: 1,
        nome: "Notebook",
        descricao: "Notebook corporativo",
        preco: 3000,
        estoque: 3
      });

      const created = await request(app)
        .post("/api/v1/pedidos")
        .send({
          clienteId: "cliente-sql",
          nomeCliente: "Maria Silva",
          emailCliente: "maria@email.com",
          itens: [{ produtoId: 1, quantidade: 1 }]
        });

      expect(created.status).toBe(201);
      expect(created.body.pedidoId).toEqual(expect.any(String));
    }, 180_000);
  });
});
