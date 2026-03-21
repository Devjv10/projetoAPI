import request from "supertest";
import app from "../../../src/app";
import { products } from "../../../src/data/products";
import { makeProductPayload } from "../../helpers/productFactory";

describe("POST /products", () => {
  it("deve criar um novo produto", async () => {
    const payload = makeProductPayload({
      nome: "Headset Sem Fio",
      estoque: 8
    });

    const response = await request(app).post("/products").send(payload);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ id: 1, ...payload });
    expect(products).toContainEqual({ id: 1, ...payload });
  });

  it("deve retornar 400 quando os dados forem invalidos", async () => {
    const response = await request(app).post("/products").send({
      nome: "Produto Invalido",
      preco: "100"
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "Dados invalidos. Informe nome, descricao, preco e estoque corretamente."
    });
  });
});
