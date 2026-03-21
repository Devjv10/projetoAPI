import { products } from "../../src/data/products";
import { Product } from "../../src/models/Product";

type ProductPayload = Omit<Product, "id">;

export const makeProductPayload = (
  overrides: Partial<ProductPayload> = {}
): ProductPayload => ({
  nome: "Notebook Gamer",
  descricao: "Notebook com 16GB de RAM e SSD de 512GB",
  preco: 5999.9,
  estoque: 12,
  ...overrides
});

export const makeProduct = (
  overrides: Partial<Product> = {}
): Product => ({
  id: 1,
  ...makeProductPayload(),
  ...overrides
});

export const seedProducts = (...items: Product[]): void => {
  products.splice(0, products.length, ...items);
};
