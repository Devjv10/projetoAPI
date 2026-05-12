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
docker run -p 4000:4000 product-catalog-api
```

### Rodar com Docker Compose

```bash
docker compose up --build
```

RabbitMQ Management UI:

- `http://localhost:15672`
- usuario: `guest`
- senha: `guest`

## Testes

```bash
npm test
```

Os testes validam criacao de pedido, publicacao do evento em memoria, consumo de notificacao, projecao no read model, consulta por ID, status para polling e idempotencia.
