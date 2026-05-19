import { Router } from "express";
import {
  atualizarStatusPedido,
  criarPedido,
  listarPedidosCliente,
  obterPedidoPorId,
  obterStatusPedido
} from "../controllers/pedidoController";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CriarPedidoItem:
 *       type: object
 *       required:
 *         - produtoId
 *         - quantidade
 *       properties:
 *         produtoId:
 *           type: number
 *           example: 1
 *         quantidade:
 *           type: number
 *           example: 2
 *     CriarPedidoRequest:
 *       type: object
 *       required:
 *         - clienteId
 *         - nomeCliente
 *         - emailCliente
 *         - itens
 *       properties:
 *         clienteId:
 *           type: string
 *           example: cliente-1
 *         nomeCliente:
 *           type: string
 *           example: Maria Silva
 *         emailCliente:
 *           type: string
 *           example: maria@email.com
 *         itens:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CriarPedidoItem'
 *     PedidoDetalhe:
 *       type: object
 *       properties:
 *         pedidoId:
 *           type: string
 *         nomeCliente:
 *           type: string
 *         emailCliente:
 *           type: string
 *         status:
 *           type: string
 *           example: Confirmado
 *         valorTotal:
 *           type: number
 *         criadoEm:
 *           type: string
 *         criadoEmFormatado:
 *           type: string
 *         itens:
 *           type: array
 *           items:
 *             type: object
 */

/**
 * @swagger
 * /api/v1/pedidos:
 *   post:
 *     summary: Cria um pedido e publica o evento PedidoCriado
 *     tags: [Pedidos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CriarPedidoRequest'
 *     responses:
 *       201:
 *         description: Pedido criado; retorna apenas o ID do pedido
 *       400:
 *         description: Dados invalidos, produto inexistente ou estoque insuficiente
 *   get:
 *     summary: Lista pedidos do cliente pelo read model
 *     tags: [Pedidos]
 *     parameters:
 *       - in: query
 *         name: clienteId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista resumida de pedidos
 */
router.post("/", criarPedido);
router.get("/", listarPedidosCliente);

/**
 * @swagger
 * /api/v1/pedidos/{id}/status:
 *   get:
 *     summary: Retorna o status atual do pedido
 *     tags: [Pedidos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Status do pedido
 *       404:
 *         description: Pedido nao encontrado
 */
router.get("/:id/status", obterStatusPedido);
router.put("/:id/status", atualizarStatusPedido);

/**
 * @swagger
 * /api/v1/pedidos/{id}:
 *   get:
 *     summary: Obtem os detalhes do pedido pelo read model
 *     tags: [Pedidos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pedido encontrado no read model
 *       404:
 *         description: Pedido nao encontrado no read model
 */
router.get("/:id", obterPedidoPorId);

export default router;
