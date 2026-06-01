import { CommonModule } from "@angular/common";
import { Component, OnInit, computed, inject } from "@angular/core";
import { VersionService } from "../../core/services/version.service";

@Component({
  selector: "app-footer",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./footer.component.html",
  styleUrl: "./footer.component.css"
})
export class FooterComponent implements OnInit {
  private readonly versionService = inject(VersionService);

  readonly versionInfo = this.versionService.versionInfo;
  readonly badgeClass = computed(() => {
    const environment = this.versionInfo()?.environment.toLowerCase() ?? "development";

    if (environment.includes("prod")) {
      return "version-badge version-badge--production";
    }

    if (environment.includes("stag")) {
      return "version-badge version-badge--staging";
    }

    return "version-badge version-badge--development";
  });

  ngOnInit(): void {
    this.versionService.load();
  }
}
