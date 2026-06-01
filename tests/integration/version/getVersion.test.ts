import request from "supertest";
import app from "../../../src/app";

describe("GET /api/v1/version", () => {
  it("deve retornar versao, ambiente, data de build e hash do commit", async () => {
    const response = await request(app).get("/api/v1/version");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      version: expect.any(String),
      environment: expect.any(String),
      buildDate: expect.any(String),
      commitHash: expect.any(String)
    });
  });
});
