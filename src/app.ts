import express, { Request, Response } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { configureApplication } from "./application/bootstrap";
import productRoutes from "./routes/productRoutes";
import pedidoRoutes from "./routes/pedidoRoutes";

const app = express();
const port = Number(process.env.PORT) || 4000;
const serverUrl = process.env.SERVER_URL || `http://localhost:${port}`;

configureApplication();

app.use(express.json());

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
app.use("/products", productRoutes);
app.use("/api/v1/pedidos", pedidoRoutes);

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "Healthy" });
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "Rota nao encontrada." });
});

export default app;
