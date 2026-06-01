import { HttpClient } from "@angular/common/http";
import { Injectable, inject, signal } from "@angular/core";

export interface VersionInfo {
  version: string;
  environment: string;
  buildDate: string;
  commitHash: string;
}

@Injectable({
  providedIn: "root"
})
export class VersionService {
  private readonly http = inject(HttpClient);
  private readonly versionSignal = signal<VersionInfo | null>(null);

  readonly versionInfo = this.versionSignal.asReadonly();

  load(): void {
    this.http.get<VersionInfo>("/api/v1/version").subscribe({
      next: (versionInfo) => this.versionSignal.set(versionInfo),
      error: () =>
        this.versionSignal.set({
          version: "indisponivel",
          environment: "unknown",
          buildDate: "",
          commitHash: ""
        })
    });
  }
}
