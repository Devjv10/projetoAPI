import { Router } from "express";
import { runHealthChecks } from "../infrastructure/health/healthChecks";

const router = Router();

const statusCodeByHealth = {
  Healthy: 200,
  Degraded: 200,
  Unhealthy: 503
};

router.get("/live", async (_req, res) => {
  const report = await runHealthChecks("live");
  res.status(statusCodeByHealth[report.status]).json(report);
});

router.get("/ready", async (_req, res) => {
  const report = await runHealthChecks("ready");
  res.status(statusCodeByHealth[report.status]).json(report);
});

router.get("/", async (_req, res) => {
  const report = await runHealthChecks("all");
  res.status(statusCodeByHealth[report.status]).json(report);
});

export default router;
