import { createServer, Server as HttpServer } from "http";
import { AddressInfo } from "net";
import { io as createClient, Socket } from "socket.io-client";
import app from "../../../src/app";
import { AtualizarStatusPedidoCommandHandler } from "../../../src/application/Commands/AtualizarStatusPedido/AtualizarStatusPedidoCommandHandler";
import { eventBus } from "../../../src/application/eventBus/InMemoryEventBus";
import { pedidos } from "../../../src/data/pedidos";
import { pedidosReadModel } from "../../../src/data/readModels";
import { attachPedidoHub } from "../../../src/infrastructure/realtime/PedidoHub";

describe("PedidoHub", () => {
  let server: HttpServer;
  let client: Socket;

  afterEach((done) => {
    client?.disconnect();
    if (!server) {
      done();
      return;
    }

    server.close(done);
  });

  it("AssinarPedido_DeveReceberNotificacaoStatusAtualizado", async () => {
    const pedidoId = "pedido-signalr-1";
    pedidos.push({
      id: pedidoId,
      clienteId: "cliente-1",
      nomeCliente: "Maria Silva",
      emailCliente: "maria@email.com",
      status: "Criado",
      valorTotal: 100,
      criadoEm: new Date().toISOString(),
      itens: []
    });
    pedidosReadModel.push({
      pedidoId,
      clienteId: "cliente-1",
      nomeCliente: "Maria Silva",
      emailCliente: "maria@email.com",
      status: "Criado",
      valorTotal: 100,
      criadoEm: new Date().toISOString()
    });

    server = createServer(app);
    await attachPedidoHub(server);
    await new Promise<void>((resolve) => server.listen(0, resolve));

    const port = (server.address() as AddressInfo).port;
    client = createClient(`http://localhost:${port}`, {
      path: "/hubs/pedidos",
      transports: ["websocket"]
    });

    await new Promise<void>((resolve, reject) => {
      client.once("connect", resolve);
      client.once("connect_error", reject);
    });

    await new Promise<void>((resolve) => client.emit("AssinarPedido", pedidoId, resolve));

    const received = new Promise((resolve) => {
      client.once("StatusAtualizado", resolve);
    });

    await new AtualizarStatusPedidoCommandHandler(eventBus).handle({
      pedidoId,
      novoStatus: "Confirmado",
      observacao: "Pagamento aprovado"
    });

    await expect(received).resolves.toMatchObject({
      pedidoId,
      statusAnterior: "Criado",
      novoStatus: "Confirmado",
      observacao: "Pagamento aprovado"
    });
  });
});
