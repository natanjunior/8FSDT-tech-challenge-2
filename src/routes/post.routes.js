'use strict';

const express = require('express');
const router = express.Router();
const PostController = require('../controllers/post.controller');
const { authenticate } = require('../middlewares/authenticate');
const { authorize } = require('../middlewares/authorize');
const postReadRoutes = require('./postRead.routes');

/**
 * Middleware de autenticação opcional
 * Se token presente → valida e adiciona req.user
 * Se token ausente → req.user = null (permite acesso público)
 */
const optionalAuth = (req, res, next) => {
	const authHeader = req.headers.authorization;

	if (!authHeader) {
		req.user = null;
		return next();
	}

	return authenticate(req, res, next);
};

/**
 * GET /posts
 * Lista posts com visibilidade por role
 * Autenticação: Opcional
 * - TEACHER: vê todos os posts
 * - STUDENT/não autenticado: vê apenas PUBLISHED
 */
router.get('/', optionalAuth, (req, res) => PostController.listPosts(req, res));

/**
 * GET /posts/search
 * Busca posts com filtros (query, title, author)
 * Autenticação: Opcional
 * OBS: Deve vir ANTES de /:id senão "search" será interpretado como id
 */
router.get('/search', optionalAuth, (req, res) => PostController.searchPosts(req, res));

/**
 * GET /posts/:id
 * Busca post por ID
 * Autenticação: Obrigatória
 */
router.get('/:id', authenticate, (req, res) => PostController.getPostById(req, res));

/**
 * POST /posts
 * Cria novo post
 * Autenticação: Obrigatória (apenas TEACHER)
 */
router.post('/', authenticate, authorize(['TEACHER']), (req, res) =>
	PostController.createPost(req, res)
);

/**
 * PUT /posts/:id
 * Atualiza post (SEM ownership check - qualquer TEACHER pode editar)
 * Autenticação: Obrigatória (apenas TEACHER)
 */
router.put('/:id', authenticate, authorize(['TEACHER']), (req, res) =>
	PostController.updatePost(req, res)
);

/**
 * DELETE /posts/:id
 * Deleta post (HARD DELETE - SEM ownership check)
 * Autenticação: Obrigatória (apenas TEACHER)
 */
router.delete('/:id', authenticate, authorize(['TEACHER']), (req, res) =>
	PostController.deletePost(req, res)
);

// Montar sub-rotas de post reads
router.use('/', postReadRoutes);

module.exports = router;
