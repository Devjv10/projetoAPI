import { HttpClient } from "@angular/common/http";
import { Injectable, computed, inject, signal } from "@angular/core";
import { interval, startWith, switchMap } from "rxjs";

export type HealthStatus = "Healthy" | "Degraded" | "Unhealthy";

export interface HealthCheckItem {
  name: string;
  status: HealthStatus;
  description?: string;
  durationMs: number;
}

export interface HealthReport {
  status: HealthStatus;
  checks: HealthCheckItem[];
}

@Injectable({
  providedIn: "root"
})
export class HealthService {
  private readonly http = inject(HttpClient);
  private readonly healthReportSignal = signal<HealthReport | null>(null);
  private readonly errorSignal = signal<string | null>(null);

  readonly healthReport = this.healthReportSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly status = computed<HealthStatus>(() => this.healthReportSignal()?.status ?? "Unhealthy");

  startPolling(): void {
    interval(30_000)
      .pipe(
        startWith(0),
        switchMap(() => this.http.get<HealthReport>("/health"))
      )
      .subscribe({
        next: (report) => {
          this.healthReportSignal.set(report);
          this.errorSignal.set(null);
        },
        error: (error) => {
          this.healthReportSignal.set({
            status: "Unhealthy",
            checks: []
          });
          this.errorSignal.set(error instanceof Error ? error.message : "Health check indisponivel.");
        }
      });
  }
}
