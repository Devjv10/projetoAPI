# Product Catalog API + Pedidos

API REST para catalogo de produtos e pedidos usando Node.js, Express e TypeScript.
O modulo de pedidos simula a evolucao para arquitetura orientada a eventos, com RabbitMQ, consumidores, idempotencia e read model separado.

## Como rodar

```bash
npm install
npm run dev
```

Aplicacao disponivel em `http://localhost:4000`.

## Endpoints

- `POST /products`
- `GET /products`
- `GET /products/:id`
- `PUT /products/:id`
- `DELETE /products/:id`
- `POST /api/v1/pedidos`
- `GET /api/v1/pedidos?clienteId={clienteId}`
- `GET /api/v1/pedidos/:id`
- `GET /api/v1/pedidos/:id/status`
- `GET /health/live`
- `GET /health/ready`
- `GET /health`
- `GET /metrics`

### Exemplo de pedido

```json
{
  "clienteId": "cliente-1",
  "nomeCliente": "Maria Silva",
  "emailCliente": "maria@email.com",
  "itens": [
    {
      "produtoId": 1,
      "quantidade": 2
    }
  ]
}
```

Ao criar um pedido, a API retorna apenas:

```json
{
  "pedidoId": "guid-do-pedido"
}
```

O evento `PedidoCriadoEvent` e publicado no RabbitMQ quando a stack esta rodando via Docker Compose. Os consumidores simulam notificacao por e-mail e atualizam o read model de pedidos.

## Documentacao

Acesse:

- `http://localhost:4000/api-docs`

## Docker

### Build da imagem

```bash
docker build -t product-catalog-api .
```

### Rodar com Docker

```bash
docker run -p 4000:5000 product-catalog-api
```

### Rodar com Docker Compose

```bash
docker compose up -d --build
```

A API fica disponivel em `http://localhost:4000`, mesmo usando a porta interna `5000` no container para o scraping do Prometheus.

RabbitMQ Management UI:

- `http://localhost:15672`
- usuario: `guest`
- senha: `guest`

Prometheus:

- `http://localhost:9090`
- target esperado: `gestaopedidos-api`

Grafana:

- `http://localhost:3000`
- usuario: `admin`
- senha: `gestaopedidos@2025`

SQL Server:

- host: `localhost,1433`
- usuario: `sa`
- senha padrao: `GestaoPedidos@2025!`

## Observabilidade e resiliencia

Esta versao implementa a Aula 11 na stack Node.js/Express do projeto.

### Logs estruturados

Os logs sao emitidos em JSON no console e em `logs/gestaopedidos-.log`.
Cada request recebe um `x-correlation-id`, reaproveitando o header recebido ou gerando um novo valor. Os logs incluem `correlationId`, `environmentName`, `machineName`, `pedidoId`, `userId`, `valorTotal` e `status` quando aplicavel.

### Health checks

```bash
curl http://localhost:4000/health/live
curl http://localhost:4000/health/ready
curl http://localhost:4000/health
```

- `/health/live`: verifica se o processo esta vivo.
- `/health/ready`: verifica SQL Server, Redis, RabbitMQ e escrita no diretorio `logs`.
- `/health`: exibe todos os checks.

### Metricas Prometheus

```bash
curl http://localhost:4000/metrics
```

Metricas de negocio:

- `gestaopedidos_pedidos_criados_total`
- `gestaopedidos_pedidos_ativos`
- `gestaopedidos_pedido_criacao_duracao_segundos`

Metricas HTTP:

- `http_requests_received_total`
- `http_request_duration_seconds`

### Dashboard Grafana

Crie um datasource Prometheus apontando para:

```text
http://prometheus:9090
```

Sugestao de paineis:

```promql
rate(gestaopedidos_pedidos_criados_total[1m])
```

```promql
histogram_quantile(0.95, rate(gestaopedidos_pedido_criacao_duracao_segundos_bucket[5m]))
```

```promql
sum(rate(http_requests_received_total[1m])) by (code)
```

### Validacao completa

```bash
docker compose up -d --build
docker compose ps
curl http://localhost:4000/health/live
curl http://localhost:4000/health/ready
curl http://localhost:4000/health
curl http://localhost:4000/metrics
docker compose logs api
```

No Prometheus, acesse `Status > Targets` e confirme o target `gestaopedidos-api` como `UP`.
No Grafana, crie o datasource Prometheus com a URL interna `http://prometheus:9090`.

### Resiliencia em pagamentos

O `PagamentosClient` em `src/infrastructure/http/PagamentosClient.ts` aplica retry apenas na consulta idempotente `GET /pagamentos/{id}` com backoff exponencial, jitter, timeout e circuit breaker. Retries, abertura e fechamento do circuit breaker sao registrados nos logs estruturados.

## Testes

```bash
npm run build
npm test
```

Os testes validam criacao de pedido, publicacao do evento em memoria, consumo de notificacao, projecao no read model, consulta por ID, status para polling e idempotencia.
