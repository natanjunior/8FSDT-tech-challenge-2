'use strict';

const express = require('express');
const router = express.Router();
const { commentController, authenticate } = require('../container');
const { validate } = require('../middlewares/validate');
const {
  searchCommentsValidator,
  createCommentValidator,
  deleteCommentValidator
} = require('../validators/comment.validator');

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    req.user = null;
    return next();
  }
  return authenticate(req, res, next);
};

/**
 * @swagger
 * /comments/search:
 *   get:
 *     summary: Buscar comentários
 *     description: |
 *       Lista comentários com paginação e ordenação FHIR.
 *       O campo `can_delete` é calculado server-side baseado na identidade do requisitante.
 *       Ordenação default: -mine,-created_at (meus comentários primeiro).
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *       - {}
 *     parameters:
 *       - in: query
 *         name: post_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por post
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: "Ordenação FHIR. Campos: created_at, updated_at, mine. Ex: -mine,-created_at"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 50
 *       - in: header
 *         name: X-Anonymous-Id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID do visitante anônimo (para can_delete)
 *     responses:
 *       200:
 *         description: Lista de comentários
 */
router.get('/search', optionalAuth, searchCommentsValidator, validate, (req, res) =>
  commentController.searchComments(req, res)
);

/**
 * @swagger
 * /comments:
 *   post:
 *     summary: Criar comentário
 *     description: |
 *       Cria um comentário. Se não autenticado, usa X-Anonymous-Id para identificação.
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *       - {}
 */
router.post('/', optionalAuth, createCommentValidator, validate, (req, res) =>
  commentController.createComment(req, res)
);

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Deletar comentário
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *       - {}
 */
router.delete('/:id', optionalAuth, deleteCommentValidator, validate, (req, res) =>
  commentController.deleteComment(req, res)
);

module.exports = router;
