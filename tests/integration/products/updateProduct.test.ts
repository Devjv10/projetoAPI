import request from "supertest";
import app from "../../../src/app";
import { products } from "../../../src/data/products";
import {
  makeProduct,
  makeProductPayload,
  seedProducts
} from "../../helpers/productFactory";

describe("PUT /products/:id", () => {
  it("deve atualizar um produto existente", async () => {
    seedProducts(makeProduct({ id: 1, nome: "Mouse Gamer" }));

    const payload = makeProductPayload({
      nome: "Mouse Gamer Pro",
      descricao: "Mouse com sensor de alta precisao",
      preco: 349.9,
      estoque: 20
    });

    const response = await request(app).put("/products/1").send(payload);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id: 1, ...payload });
    expect(products[0]).toEqual({ id: 1, ...payload });
  });

  it("deve retornar 404 quando o produto nao existir", async () => {
    const response = await request(app)
      .put("/products/10")
      .send(makeProductPayload());

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Produto nao encontrado." });
  });
});
