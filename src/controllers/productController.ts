import { Request, Response } from "express";
import { products } from "../data/products";
import { Product } from "../models/Product";

type ProductPayload = Omit<Product, "id">;

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

export const createProduct = (req: Request, res: Response): void => {
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
  res.status(201).json(newProduct);
};

export const getAllProducts = (_req: Request, res: Response): void => {
  res.status(200).json(products);
};

export const getProductById = (req: Request, res: Response): void => {
  const productId = getProductId(String(req.params.id));

  if (productId === null) {
    res.status(400).json({ message: "ID invalido." });
    return;
  }

  const product = products.find((item) => item.id === productId);

  if (!product) {
    res.status(404).json({ message: "Produto nao encontrado." });
    return;
  }

  res.status(200).json(product);
};

export const updateProduct = (req: Request, res: Response): void => {
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
  res.status(200).json(updatedProduct);
};

export const deleteProduct = (req: Request, res: Response): void => {
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
  res.status(200).json({ message: "Produto removido com sucesso." });
};
