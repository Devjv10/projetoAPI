import fs from "fs";
import os from "os";
import path from "path";
import { randomUUID } from "crypto";
import { NextFunction, Request, Response } from "express";
import winston from "winston";

const logsDirectory = path.resolve(process.cwd(), "logs");

if (!fs.existsSync(logsDirectory)) {
  fs.mkdirSync(logsDirectory, { recursive: true });
}

const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format((info) => {
    info.environmentName = process.env.NODE_ENV || "development";
    info.machineName = os.hostname();
    return info;
  })(),
  winston.format.json()
);

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  defaultMeta: {
    service: "gestaopedidos-api"
  },
  transports: [
    new winston.transports.Console({ format: jsonFormat }),
    new winston.transports.File({
      filename: path.join(logsDirectory, "gestaopedidos-.log"),
      format: jsonFormat
    })
  ]
});

export const correlationIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const headerCorrelationId = req.header("x-correlation-id");
  const correlationId = headerCorrelationId && headerCorrelationId.trim().length > 0
    ? headerCorrelationId
    : randomUUID();

  res.setHeader("x-correlation-id", correlationId);
  req.correlationId = correlationId;
  next();
};

export const requestLoggingMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startedAt = process.hrtime.bigint();

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;

    logger.info("HTTP request processed", {
      correlationId: req.correlationId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs
    });
  });

  next();
};
