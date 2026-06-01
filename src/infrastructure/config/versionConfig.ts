import fs from "fs";
import path from "path";
import { VersionDto } from "../../application/DTOs/VersionDto";

interface AppSettings {
  AppVersion?: string;
}

const readAppSettings = (environment: string): AppSettings => {
  const baseSettingsPath = path.resolve(process.cwd(), "appsettings.json");
  const environmentSettingsPath = path.resolve(process.cwd(), `appsettings.${environment}.json`);

  const settings = [baseSettingsPath, environmentSettingsPath].reduce<AppSettings>(
    (currentSettings, settingsPath) => {
      if (!fs.existsSync(settingsPath)) {
        return currentSettings;
      }

      return {
        ...currentSettings,
        ...JSON.parse(fs.readFileSync(settingsPath, "utf8"))
      };
    },
    {}
  );

  return settings;
};

export const getVersionInfo = (): VersionDto => {
  const environment = process.env.NODE_ENV || "Development";
  const settings = readAppSettings(environment);

  return {
    version: process.env.APP_VERSION || settings.AppVersion || "0.1.0-dev",
    environment,
    buildDate: process.env.BUILD_DATE || new Date().toISOString(),
    commitHash: process.env.GITHUB_SHA || process.env.COMMIT_HASH || "local"
  };
};
