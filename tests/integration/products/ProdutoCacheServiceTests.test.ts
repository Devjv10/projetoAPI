import { ProdutoCacheService } from "../../../src/infrastructure/cache/ProdutoCacheService";
import { Product } from "../../../src/models/Product";

describe("ProdutoCacheService", () => {
  it("CacheAside_DeveFazerHitNaSegundaLeitura", async () => {
    const service = new ProdutoCacheService();
    const key = "produto:item:1";
    const product: Product = {
      id: 1,
      nome: "Mouse Gamer",
      descricao: "Mouse com sensor de alta precisao",
      preco: 199.9,
      estoque: 10
    };

    const primeiraLeitura = await service.getAsync(key);
    await service.setAsync(key, product);
    const segundaLeitura = await service.getAsync(key);

    expect(primeiraLeitura).toBeNull();
    expect(segundaLeitura).toEqual(product);
  });

  it("InvalidateAsync_DeveRemoverChaveDoRedis", async () => {
    const service = new ProdutoCacheService();
    const key = "produto:item:2";

    await service.setAsync(key, {
      id: 2,
      nome: "Teclado",
      descricao: "Teclado mecanico",
      preco: 300,
      estoque: 5
    });

    await service.invalidateAsync(key);

    expect(await service.getAsync(key)).toBeNull();
  });
});
