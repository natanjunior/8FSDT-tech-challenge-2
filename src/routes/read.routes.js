'use strict';

const express = require('express');
const router = express.Router();
const { readController, authenticate } = require('../container');
const { validate } = require('../middlewares/validate');
const { createReadValidator, searchReadsValidator } = require('../validators/read.validator');

/**
 * @swagger
 * /reads:
 *   post:
 *     summary: Marcar post como lido
 *     description: |
 *       Marca um post como lido pelo usuário autenticado.
 *       Operação idempotente — marcar o mesmo post mais de uma vez retorna o registro existente (200).
 *     tags: [Reads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [post_id]
 *             properties:
 *               post_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Post marcado como lido (novo registro)
 *       200:
 *         description: Post já estava marcado como lido (idempotente)
 *       404:
 *         description: Post não encontrado
 *       401:
 *         description: Token não fornecido ou inválido
 */
router.post('/', authenticate, createReadValidator, validate, (req, res) =>
  readController.markAsRead(req, res)
);

/**
 * @swagger
 * /reads/search:
 *   get:
 *     summary: Listar leituras do usuário
 *     description: |
 *       Lista os posts que o usuário autenticado marcou como lidos.
 *       Use ?post_id= para verificar se um post específico foi lido.
 *       Ordenação FHIR — campo disponível: read_at. Default: -read_at.
 *     tags: [Reads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: post_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por post específico
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: "Ordenação FHIR. Campo: read_at. Ex: -read_at"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Lista de leituras
 *       401:
 *         description: Token não fornecido ou inválido
 */
router.get('/search', authenticate, searchReadsValidator, validate, (req, res) =>
  readController.searchReads(req, res)
);

module.exports = router;
