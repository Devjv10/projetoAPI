import { logger } from "../logging/logger";

type CircuitState = "closed" | "open" | "half-open";

type PagamentoResponse = {
  id: string;
  status: string;
  valor?: number;
};

type RetryOptions = {
  maxRetries: number;
  baseDelayMs: number;
  timeoutMs: number;
  circuitFailureThreshold: number;
  circuitOpenMs: number;
};

const defaultOptions: RetryOptions = {
  maxRetries: 3,
  baseDelayMs: 200,
  timeoutMs: 1500,
  circuitFailureThreshold: 3,
  circuitOpenMs: 30_000
};

export class PagamentosClient {
  private readonly baseUrl = process.env.PAGAMENTOS_BASE_URL || "http://pagamentos-api:5000";
  private readonly options: RetryOptions;
  private circuitState: CircuitState = "closed";
  private failures = 0;
  private nextAttemptAt = 0;

  constructor(options: Partial<RetryOptions> = {}) {
    this.options = { ...defaultOptions, ...options };
  }

  async obterPagamento(id: string, correlationId?: string): Promise<PagamentoResponse> {
    this.ensureCircuitAllowsRequest(correlationId);

    for (let attempt = 1; attempt <= this.options.maxRetries + 1; attempt += 1) {
      try {
        const response = await this.fetchWithTimeout(`${this.baseUrl}/pagamentos/${id}`);

        if (!response.ok) {
          throw new Error(`Pagamentos retornou HTTP ${response.status}.`);
        }

        this.registerSuccess(correlationId);
        return await response.json() as PagamentoResponse;
      } catch (error) {
        this.registerFailure(correlationId, error);

        if (attempt > this.options.maxRetries) {
          throw error;
        }

        const delayMs = this.calculateBackoffWithJitter(attempt);
        logger.warn("Retry em consulta idempotente de pagamento", {
          correlationId,
          pagamentoId: id,
          attempt,
          delayMs,
          error: error instanceof Error ? error.message : "Erro desconhecido"
        });

        await this.sleep(delayMs);
      }
    }

    throw new Error("Falha inesperada ao consultar pagamento.");
  }

  private ensureCircuitAllowsRequest(correlationId?: string): void {
    if (this.circuitState !== "open") {
      return;
    }

    if (Date.now() >= this.nextAttemptAt) {
      this.circuitState = "half-open";
      logger.info("Circuit breaker de pagamentos em half-open", { correlationId });
      return;
    }

    throw new Error("Circuit breaker de pagamentos esta aberto.");
  }

  private registerSuccess(correlationId?: string): void {
    const previousState = this.circuitState;
    this.failures = 0;
    this.circuitState = "closed";

    if (previousState !== "closed") {
      logger.info("Circuit breaker de pagamentos fechado", { correlationId });
    }
  }

  private registerFailure(correlationId: string | undefined, error: unknown): void {
    this.failures += 1;

    if (this.failures < this.options.circuitFailureThreshold || this.circuitState === "open") {
      return;
    }

    this.circuitState = "open";
    this.nextAttemptAt = Date.now() + this.options.circuitOpenMs;
    logger.error("Circuit breaker de pagamentos aberto", {
      correlationId,
      failures: this.failures,
      openMs: this.options.circuitOpenMs,
      error: error instanceof Error ? error.message : "Erro desconhecido"
    });
  }

  private async fetchWithTimeout(url: string): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.options.timeoutMs);

    try {
      return await fetch(url, {
        method: "GET",
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeout);
    }
  }

  private calculateBackoffWithJitter(attempt: number): number {
    const exponentialDelay = this.options.baseDelayMs * 2 ** (attempt - 1);
    const jitter = Math.floor(Math.random() * this.options.baseDelayMs);
    return exponentialDelay + jitter;
  }

  private sleep(delayMs: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, delayMs);
    });
  }
}
