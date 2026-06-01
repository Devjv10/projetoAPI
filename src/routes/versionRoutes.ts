import { Router } from "express";
import { getVersion } from "../controllers/versionController";

const router = Router();

/**
 * @swagger
 * /api/v1/version:
 *   get:
 *     summary: Retorna informacoes de versao da aplicacao
 *     tags: [Version]
 *     responses:
 *       200:
 *         description: Versao, ambiente, data de build e hash do commit
 */
router.get("/", getVersion);

export default router;
