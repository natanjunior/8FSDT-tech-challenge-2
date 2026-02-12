'use strict';

const express = require('express');
const router = express.Router();
const PostReadController = require('../controllers/postRead.controller');
const { authenticate } = require('../middlewares/authenticate');

/**
 * @swagger
 * /posts/{id}/read:
 *   post:
 *     summary: Marcar post como lido
 *     description: |
 *       Marca um post como lido pelo usuário autenticado.
 *       Operação idempotente - marcar o mesmo post mais de uma vez retorna o mesmo registro.
 *     tags: [Post Reads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do post
 *     responses:
 *       201:
 *         description: Post marcado como lido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostRead'
 *       200:
 *         description: Post já estava marcado como lido (idempotente)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostRead'
 *       404:
 *         description: Post não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Token não fornecido ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:id/read', authenticate, PostReadController.markAsRead);

/**
 * @swagger
 * /posts/{id}/read:
 *   get:
 *     summary: Verificar se post foi lido
 *     description: Verifica se o usuário autenticado já leu o post especificado.
 *     tags: [Post Reads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do post
 *     responses:
 *       200:
 *         description: Status de leitura
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReadStatus'
 *       401:
 *         description: Token não fornecido ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id/read', authenticate, PostReadController.checkIfRead);

module.exports = router;
