import express, { Request, Response } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { configureApplication } from "./application/bootstrap";
import { correlationIdMiddleware, requestLoggingMiddleware } from "./infrastructure/logging/logger";
import { httpMetricsMiddleware, metricsHandler } from "./infrastructure/metrics/prometheus";
import healthRoutes from "./routes/healthRoutes";
import productRoutes from "./routes/productRoutes";
import pedidoRoutes from "./routes/pedidoRoutes";
import versionRoutes from "./routes/versionRoutes";

const app = express();
const port = Number(process.env.PORT) || 4000;
const serverUrl = process.env.SERVER_URL || `http://localhost:${port}`;

configureApplication();

app.use(express.json());
app.use(correlationIdMiddleware);
app.use(requestLoggingMiddleware);
app.use(httpMetricsMiddleware);

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Product Catalog API",
      version: "1.0.0",
      description: "Documentacao da API REST para catalogo de produtos"
    },
    servers: [
      {
        url: serverUrl
      }
    ]
  },
  apis: ["./src/routes/*.ts", "./dist/routes/*.js"]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/metrics", metricsHandler);
app.use("/health", healthRoutes);
app.use("/products", productRoutes);
app.use("/api/v1/pedidos", pedidoRoutes);
app.use("/api/v1/version", versionRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "Rota nao encontrada." });
});

export default app;
