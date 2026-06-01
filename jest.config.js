/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup/jest.setup.ts"],
  moduleFileExtensions: ["ts", "js", "json"],
  testMatch: ["**/*.test.ts"],
  clearMocks: true,
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/server.ts",
    "!src/app/core/**",
    "!src/types/**",
    "!src/application/bootstrap.ts",
    "!src/application/eventBus/RabbitMqConsumerHost.ts",
    "!src/application/eventBus/RabbitMqPublisher.ts",
    "!src/infrastructure/HealthChecks/**",
    "!src/infrastructure/health/**",
    "!src/infrastructure/realtime/**"
  ],
  coverageReporters: ["text", "lcov", "cobertura"],
  transform: {
    "^.+\\.ts$": ["ts-jest", { tsconfig: "tsconfig.jest.json" }]
  },
  reporters: [
    "default",
    ["jest-junit", { outputDirectory: ".", outputName: "junit.xml" }]
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  testTimeout: 15000
};
