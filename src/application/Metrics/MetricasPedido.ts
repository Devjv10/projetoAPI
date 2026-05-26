import client from "prom-client";

export const pedidosCriadosTotal = new client.Counter({
  name: "gestaopedidos_pedidos_criados_total",
  help: "Total de pedidos criados"
});

export const pedidosAtivos = new client.Gauge({
  name: "gestaopedidos_pedidos_ativos",
  help: "Quantidade de pedidos ativos"
});

export const pedidoCriacaoDuracaoSegundos = new client.Histogram({
  name: "gestaopedidos_pedido_criacao_duracao_segundos",
  help: "Duracao da criacao de pedidos em segundos",
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5]
});

export const metricasPedido = {
  pedidosCriadosTotal,
  pedidosAtivos,
  pedidoCriacaoDuracaoSegundos
};
