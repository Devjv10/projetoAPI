import request from "supertest";
import app from "../../../src/app";
import { products } from "../../../src/data/products";
import { makeProduct, seedProducts } from "../../helpers/productFactory";

describe("DELETE /products/:id", () => {
  it("deve remover um produto existente", async () => {
    seedProducts(
      makeProduct({ id: 1, nome: "Mouse Gamer" }),
      makeProduct({ id: 2, nome: "Teclado Mecanico" })
    );

    const response = await request(app).delete("/products/1");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Produto removido com sucesso." });
    expect(products).toEqual([
      expect.objectContaining({ id: 2, nome: "Teclado Mecanico" })
    ]);
  });

  it("deve retornar 404 quando o produto nao existir", async () => {
    const response = await request(app).delete("/products/77");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Produto nao encontrado." });
  });
});
