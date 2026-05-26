import { NextFunction, Request, Response } from "express";
import client from "prom-client";

client.collectDefaultMetrics({
  prefix: "gestaopedidos_"
});

export const httpRequestsReceivedTotal = new client.Counter({
  name: "http_requests_received_total",
  help: "Total de requisicoes HTTP recebidas",
  labelNames: ["method", "route", "code"] as const
});

export const httpRequestDurationSeconds = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duracao das requisicoes HTTP em segundos",
  labelNames: ["method", "route", "code"] as const,
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5]
});

export const httpMetricsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const endTimer = httpRequestDurationSeconds.startTimer();

  res.on("finish", () => {
    const route = req.route?.path ? `${req.baseUrl}${req.route.path}` : req.path;
    const labels = {
      method: req.method,
      route,
      code: String(res.statusCode)
    };

    httpRequestsReceivedTotal.inc(labels);
    endTimer(labels);
  });

  next();
};

export const metricsHandler = async (_req: Request, res: Response): Promise<void> => {
  res.setHeader("Content-Type", client.register.contentType);
  res.status(200).send(await client.register.metrics());
};
