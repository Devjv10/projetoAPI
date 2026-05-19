import { Request, Response } from "express";
import { products } from "../data/products";
import { ProdutoCacheService } from "../infrastructure/cache/ProdutoCacheService";
import { Product } from "../models/Product";

type ProductPayload = Omit<Product, "id">;
const produtoCacheService = new ProdutoCacheService();

const getProductId = (idParam: string): number | null => {
  const productId = Number(idParam);
  return Number.isInteger(productId) ? productId : null;
};

const isValidProductPayload = (body: Partial<Product>): body is ProductPayload => {
  return (
    typeof body.nome === "string" &&
    typeof body.descricao === "string" &&
    typeof body.preco === "number" &&
    typeof body.estoque === "number"
  );
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  const productData = req.body as Partial<Product>;

  if (!isValidProductPayload(productData)) {
    res.status(400).json({
      message: "Dados invalidos. Informe nome, descricao, preco e estoque corretamente."
    });
    return;
  }

  const newProduct: Product = {
    id: products.length > 0 ? products[products.length - 1].id + 1 : 1,
    nome: productData.nome,
    descricao: productData.descricao,
    preco: productData.preco,
    estoque: productData.estoque
  };

  products.push(newProduct);
  await produtoCacheService.invalidateAsync("produto:lista:*");
  res.status(201).json(newProduct);
};

export const getAllProducts = async (_req: Request, res: Response): Promise<void> => {
  const startedAt = Date.now();
  const cacheKey = "produto:lista:todos";
  const cachedProducts = await produtoCacheService.getAsync(cacheKey);

  if (cachedProducts) {
    const elapsedMs = Date.now() - startedAt;
    produtoCacheService.recordHit(elapsedMs);
    console.log(`Cache HIT key=${cacheKey}`);
    res.status(200).json(cachedProducts);
    return;
  }

  console.log(`Cache MISS key=${cacheKey}`);
  await produtoCacheService.setAsync(cacheKey, products);
  produtoCacheService.recordMiss(Date.now() - startedAt);
  res.status(200).json(products);
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  const productId = getProductId(String(req.params.id));

  if (productId === null) {
    res.status(400).json({ message: "ID invalido." });
    return;
  }

  const startedAt = Date.now();
  const cacheKey = `produto:item:${productId}`;
  const cachedProduct = await produtoCacheService.getAsync(cacheKey);

  if (cachedProduct && !Array.isArray(cachedProduct)) {
    produtoCacheService.recordHit(Date.now() - startedAt);
    console.log(`Cache HIT key=${cacheKey}`);
    res.status(200).json(cachedProduct);
    return;
  }

  console.log(`Cache MISS key=${cacheKey}`);
  const product = products.find((item) => item.id === productId);

  if (!product) {
    res.status(404).json({ message: "Produto nao encontrado." });
    return;
  }

  await produtoCacheService.setAsync(cacheKey, product);
  produtoCacheService.recordMiss(Date.now() - startedAt);
  res.status(200).json(product);
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  const productId = getProductId(String(req.params.id));
  const productData = req.body as Partial<Product>;

  if (productId === null) {
    res.status(400).json({ message: "ID invalido." });
    return;
  }

  const productIndex = products.findIndex((item) => item.id === productId);

  if (productIndex === -1) {
    res.status(404).json({ message: "Produto nao encontrado." });
    return;
  }

  if (!isValidProductPayload(productData)) {
    res.status(400).json({
      message: "Dados invalidos. Informe nome, descricao, preco e estoque corretamente."
    });
    return;
  }

  const updatedProduct: Product = {
    id: productId,
    nome: productData.nome,
    descricao: productData.descricao,
    preco: productData.preco,
    estoque: productData.estoque
  };

  products[productIndex] = updatedProduct;
  await produtoCacheService.invalidateAsync(`produto:item:${productId}`);
  await produtoCacheService.invalidateAsync("produto:lista:*");
  res.status(200).json(updatedProduct);
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  const productId = getProductId(String(req.params.id));

  if (productId === null) {
    res.status(400).json({ message: "ID invalido." });
    return;
  }

  const productIndex = products.findIndex((item) => item.id === productId);

  if (productIndex === -1) {
    res.status(404).json({ message: "Produto nao encontrado." });
    return;
  }

  products.splice(productIndex, 1);
  await produtoCacheService.invalidateAsync(`produto:item:${productId}`);
  await produtoCacheService.invalidateAsync("produto:lista:*");
  res.status(200).json({ message: "Produto removido com sucesso." });
};

export const getProductCacheStats = async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json(await produtoCacheService.getStatsAsync());
};
