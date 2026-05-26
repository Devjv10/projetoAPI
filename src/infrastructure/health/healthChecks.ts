import { createRequire } from "module";
import sql from "mssql";
import { createClient } from "redis";
import { LogsDirectoryHealthCheck, HealthCheckResult } from "../HealthChecks/LogsDirectoryHealthCheck";

const dynamicRequire = createRequire(__filename);

type HealthStatus = "Healthy" | "Degraded" | "Unhealthy";

type NamedHealthCheckResult = HealthCheckResult & {
  name: string;
};

interface AmqpConnection {
  close(): Promise<void>;
}

interface AmqpModule {
  connect(url: string): Promise<AmqpConnection>;
}

const elapsedMs = (startedAt: bigint): number => Number(process.hrtime.bigint() - startedAt) / 1_000_000;

const healthy = (startedAt: bigint): HealthCheckResult => ({
  status: "Healthy",
  durationMs: elapsedMs(startedAt)
});

const degraded = (startedAt: bigint, description: string): HealthCheckResult => ({
  status: "Degraded",
  description,
  durationMs: elapsedMs(startedAt)
});

const unhealthy = (startedAt: bigint, error: unknown): HealthCheckResult => ({
  status: "Unhealthy",
  description: error instanceof Error ? error.message : "Health check falhou.",
  durationMs: elapsedMs(startedAt)
});

const checkSqlServer = async (): Promise<HealthCheckResult> => {
  const startedAt = process.hrtime.bigint();
  const connectionString = process.env.SQLSERVER_CONNECTION_STRING;

  if (!connectionString) {
    return degraded(startedAt, "SQLSERVER_CONNECTION_STRING nao configurada.");
  }

  try {
    const pool = await sql.connect(connectionString);
    await pool.request().query("SELECT 1");
    await pool.close();
    return healthy(startedAt);
  } catch (error) {
    return unhealthy(startedAt, error);
  }
};

const checkRedis = async (): Promise<HealthCheckResult> => {
  const startedAt = process.hrtime.bigint();
  const password = process.env.REDIS_PASSWORD;
  const url = process.env.REDIS_URL || (password ? `redis://:${password}@redis:6379` : "redis://redis:6379");
  const client = createClient({ url });

  try {
    await client.connect();
    await client.ping();
    await client.quit();
    return healthy(startedAt);
  } catch (error) {
    try {
      await client.disconnect();
    } catch {
      // Client may already be closed.
    }
    return unhealthy(startedAt, error);
  }
};

const checkRabbitMq = async (): Promise<HealthCheckResult> => {
  const startedAt = process.hrtime.bigint();
  const url = process.env.RABBITMQ_URL || "amqp://guest:guest@rabbitmq:5672";

  try {
    const amqp = dynamicRequire("amqplib") as AmqpModule;
    const connection = await amqp.connect(url);
    await connection.close();
    return healthy(startedAt);
  } catch (error) {
    return unhealthy(startedAt, error);
  }
};

const checkLive = async (): Promise<HealthCheckResult> => healthy(process.hrtime.bigint());

const aggregateStatus = (checks: NamedHealthCheckResult[]): HealthStatus => {
  if (checks.some((check) => check.status === "Unhealthy")) {
    return "Unhealthy";
  }

  if (checks.some((check) => check.status === "Degraded")) {
    return "Degraded";
  }

  return "Healthy";
};

export const runHealthChecks = async (
  scope: "live" | "ready" | "all"
): Promise<{ status: HealthStatus; checks: NamedHealthCheckResult[] }> => {
  const logsDirectoryHealthCheck = new LogsDirectoryHealthCheck();
  const checks = scope === "live"
    ? [{ name: "self", check: checkLive }]
    : [
        { name: "sqlserver", check: checkSqlServer },
        { name: "redis", check: checkRedis },
        { name: "rabbitmq", check: checkRabbitMq },
        { name: "logs-directory", check: () => logsDirectoryHealthCheck.check() }
      ];

  const results = await Promise.all(
    checks.map(async ({ name, check }) => ({
      name,
      ...(await check())
    }))
  );

  return {
    status: aggregateStatus(results),
    checks: results
  };
};
