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
 * @swagger
 * /posts:
 *   get:
 *     summary: Listar posts
 *     description: |
 *       Lista posts com visibilidade baseada no role do usuário.
 *       - TEACHER: vê todos os posts (DRAFT, PUBLISHED, ARCHIVED)
 *       - STUDENT ou não autenticado: vê apenas posts PUBLISHED
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *       - {}
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Itens por página
 *     responses:
 *       200:
 *         description: Lista de posts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostList'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', optionalAuth, (req, res) => PostController.listPosts(req, res));

/**
 * @swagger
 * /posts/search:
 *   get:
 *     summary: Buscar posts
 *     description: |
 *       Busca posts por título, conteúdo ou autor.
 *       Respeita as mesmas regras de visibilidade que a listagem.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *       - {}
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Termo de busca (título ou conteúdo)
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: Filtrar por título
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: Filtrar por nome do autor
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Itens por página
 *     responses:
 *       200:
 *         description: Resultados da busca
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostList'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/search', optionalAuth, (req, res) => PostController.searchPosts(req, res));

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Buscar post por ID
 *     description: Retorna um post específico pelo seu ID.
 *     tags: [Posts]
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
 *         description: Post encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
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
router.get('/:id', authenticate, (req, res) => PostController.getPostById(req, res));

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Criar post
 *     description: Cria um novo post. Apenas TEACHER pode criar posts.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePostRequest'
 *     responses:
 *       201:
 *         description: Post criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Dados inválidos
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
 *       403:
 *         description: Acesso negado (apenas TEACHER)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', authenticate, authorize(['TEACHER']), (req, res) =>
	PostController.createPost(req, res)
);

/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Atualizar post
 *     description: |
 *       Atualiza um post existente. Apenas TEACHER pode atualizar.
 *       Sem ownership check - qualquer TEACHER pode editar qualquer post.
 *     tags: [Posts]
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePostRequest'
 *     responses:
 *       200:
 *         description: Post atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 *       403:
 *         description: Acesso negado (apenas TEACHER)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', authenticate, authorize(['TEACHER']), (req, res) =>
	PostController.updatePost(req, res)
);

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Deletar post
 *     description: |
 *       Deleta um post permanentemente (HARD DELETE).
 *       Sem ownership check - qualquer TEACHER pode deletar qualquer post.
 *     tags: [Posts]
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
 *       204:
 *         description: Post deletado com sucesso
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
 *       403:
 *         description: Acesso negado (apenas TEACHER)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', authenticate, authorize(['TEACHER']), (req, res) =>
	PostController.deletePost(req, res)
);

// Montar sub-rotas de post reads
router.use('/', postReadRoutes);

module.exports = router;
