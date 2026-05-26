import fs from "fs/promises";
import path from "path";

export type HealthCheckResult = {
  status: "Healthy" | "Degraded" | "Unhealthy";
  description?: string;
  durationMs: number;
};

export class LogsDirectoryHealthCheck {
  private readonly logsDirectory = path.resolve(process.cwd(), "logs");

  async check(): Promise<HealthCheckResult> {
    const startedAt = process.hrtime.bigint();
    const testFile = path.join(this.logsDirectory, `.health-${Date.now()}.tmp`);

    try {
      await fs.mkdir(this.logsDirectory, { recursive: true });
      await fs.writeFile(testFile, "healthcheck", "utf8");
      await fs.unlink(testFile);

      return {
        status: "Healthy",
        durationMs: this.elapsedMs(startedAt)
      };
    } catch (error) {
      return {
        status: "Unhealthy",
        description: error instanceof Error ? error.message : "Falha ao escrever no diretorio de logs.",
        durationMs: this.elapsedMs(startedAt)
      };
    }
  }

  private elapsedMs(startedAt: bigint): number {
    return Number(process.hrtime.bigint() - startedAt) / 1_000_000;
  }
}
