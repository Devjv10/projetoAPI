# GestaoPedidos

[![CI](https://github.com/SEU_USUARIO/gestao-pedidos/actions/workflows/ci.yml/badge.svg)](https://github.com/SEU_USUARIO/gestao-pedidos/actions/workflows/ci.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=gestao-pedidos&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=gestao-pedidos)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=gestao-pedidos&metric=coverage)](https://sonarcloud.io/summary/new_code?id=gestao-pedidos)

API REST para catalogo de produtos e pedidos usando Node.js, Express e TypeScript.
O modulo de pedidos simula a evolucao para arquitetura orientada a eventos, com RabbitMQ, consumidores, idempotencia e read model separado.

> Observacao: a especificacao das aulas cita .NET 8 e Angular 17, mas este workspace esta implementado em Node.js/Express/TypeScript. As praticas de Git Flow, Conventional Commits, SemVer, CI, Quality Gates, release automatica, endpoint de versao e estrutura Angular standalone foram aplicadas preservando a stack real do repositorio.

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
- `GET /api/v1/version`
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

## Versionamento e Git Flow

Branches oficiais:

- `main`: codigo pronto para producao e releases SemVer.
- `develop`: integracao continua das features.
- `feature/*`: novas funcionalidades.
- `release/*`: estabilizacao de versao.
- `hotfix/*`: correcoes urgentes originadas de `main`.

Fluxo recomendado:

```bash
git checkout develop
git pull
git checkout -b feature/pedidos-nova-regra
git commit -m "feat(pedidos): adicionar nova regra de pedido"
git push -u origin feature/pedidos-nova-regra
```

Abra Pull Request para `develop`. Para release, crie `release/x.y.z` a partir de `develop`, estabilize, abra PR para `main` e depois sincronize `develop`.

## Branch Protection Rules

Configure no GitHub:

`main`:

- Require pull request before merging.
- Require 1 approval.
- Require status checks to pass.
- Restrict pushes.
- Require linear history.

`develop`:

- Require pull request before merging.
- Require status checks to pass.

Checks obrigatorios sugeridos:

- `Backend - Build e Testes`
- `Frontend - Build e Lint`
- `SonarCloud - Quality Gate`

## Conventional Commits

Commitlint e Husky validam as mensagens em `.husky/commit-msg`.

Tipos permitidos:

```text
feat, fix, docs, style, refactor, test, chore, perf, ci, build, revert
```

Escopos permitidos:

```text
pedidos, pagamentos, catalogo, usuarios, notificacoes, gateway, domain, angular, infra, deps
```

Exemplos validos:

```bash
git commit -m "feat(pedidos): adicionar pagamento pix"
git commit -m "fix(pagamentos): corrigir retry do polly"
git commit -m "ci(infra): adicionar pipeline github actions"
```

Regras SemVer:

- `feat` gera MINOR.
- `fix` e `perf` geram PATCH.
- `BREAKING CHANGE` ou `!` gera MAJOR.

## Releases

O release automatico usa `release-please`.

Arquivos:

- `release-please-config.json`
- `.release-please-manifest.json`
- `.github/workflows/release-please.yml`

Ao receber commits convencionais em `main`, o workflow cria ou atualiza um Pull Request de release com CHANGELOG automatico. Ao fazer merge, gera tag SemVer e GitHub Release.

Secoes do changelog:

- Novas Funcionalidades
- Correcoes
- Performance
- Refatoracoes
- Documentacao

## CI/CD e Quality Gates

O pipeline `.github/workflows/ci.yml` roda em:

- Pull Requests para `main` e `develop`.
- Push em `main`.

Jobs:

- `Backend - Build e Testes`: instala dependencias, executa lint, build, testes e cobertura.
- `Frontend - Build e Lint`: executa `ng lint` e `ng build --configuration production` quando existir `angular.json`.
- `SonarCloud - Quality Gate`: envia cobertura para SonarCloud e bloqueia falhas do Quality Gate.

Quality Gates esperados:

- Cobertura de linhas >= 70%.
- 0 falhas de teste.
- 0 bugs criticos.
- 0 blocker code smells.
- Build bem sucedido.
- Lint sem erros.

Configure os secrets no GitHub:

```text
SONAR_TOKEN
```

Atualize `sonar-project.properties` com sua organizacao real do SonarCloud.

## Endpoint de versao

```bash
curl http://localhost:4000/api/v1/version
```

Resposta:

```json
{
  "version": "0.1.0-dev",
  "environment": "Development",
  "buildDate": "2026-06-01T00:00:00.000Z",
  "commitHash": "local"
}
```

Variaveis aceitas no build:

- `APP_VERSION`
- `BUILD_DATE`
- `COMMIT_HASH`
- `GITHUB_SHA`

## Frontend Angular

Foram adicionados arquivos standalone para consumo de versao:

- `src/app/core/services/version.service.ts`
- `src/app/shared/footer/footer.component.ts`
- `src/app/shared/footer/footer.component.html`
- `src/app/shared/footer/footer.component.css`

O proxy Angular aponta `/api` para `http://localhost:5000`, conforme a especificacao das aulas.

## Pipeline local

```bash
npm ci
npm run lint
npm run build
npm run test:coverage
docker compose up -d --build
```

Validar commitlint manualmente:

```bash
echo "feat(pedidos): adicionar pagamento pix" | npx commitlint
echo "feature(outro): Mensagem Invalida" | npx commitlint
```

## Como abrir PR

```bash
git checkout develop
git pull
git checkout -b feature/escopo-descricao
git add .
git commit -m "feat(pedidos): descrever mudanca"
git push -u origin feature/escopo-descricao
```

No GitHub, abra PR para `develop` e aguarde CI e SonarCloud verdes.
