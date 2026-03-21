import request from "supertest";
import app from "../../../src/app";
import { makeProduct, seedProducts } from "../../helpers/productFactory";

describe("GET /products/:id", () => {
  it("deve retornar o produto correspondente ao id informado", async () => {
    seedProducts(
      makeProduct({ id: 1, nome: "Mouse Gamer" }),
      makeProduct({ id: 2, nome: "Monitor Ultrawide" })
    );

    const response = await request(app).get("/products/2");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({ id: 2, nome: "Monitor Ultrawide" })
    );
  });

  it("deve retornar 404 quando o produto nao existir", async () => {
    const response = await request(app).get("/products/99");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Produto nao encontrado." });
  });
});
