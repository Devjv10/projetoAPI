import request from "supertest";
import app from "../../../src/app";
import { makeProduct, seedProducts } from "../../helpers/productFactory";

describe("GET /products", () => {
  it("deve retornar todos os produtos cadastrados", async () => {
    seedProducts(
      makeProduct({ id: 1, nome: "Mouse Gamer" }),
      makeProduct({ id: 2, nome: "Teclado Mecanico" })
    );

    const response = await request(app).get("/products");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      expect.objectContaining({ id: 1, nome: "Mouse Gamer" }),
      expect.objectContaining({ id: 2, nome: "Teclado Mecanico" })
    ]);
  });

  it("deve retornar uma lista vazia quando nao houver produtos", async () => {
    const response = await request(app).get("/products");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
});
