import express, { Request, Response } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import productRoutes from "./routes/productRoutes";

const app = express();

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
        url: "http://localhost:3000"
      }
    ]
  },
  apis: ["./src/routes/*.ts"]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/products", productRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "Rota nao encontrada." });
});

export default app;
