'use strict';

const PostService = require('../services/post.service');

/**
 * PostController - Controlador de Posts
 */
class PostController {
	/**
	 * Lista posts com visibilidade por role
	 * GET /posts?page=1&limit=20
	 * Header: Authorization: Bearer <token> (opcional)
	 */
	async listPosts(req, res) {
		try {
			const { page, limit } = req.query;
			const userRole = req.user?.role || null;

			const result = await PostService.listPosts({ page, limit }, userRole);

			return res.status(200).json(result);
		} catch (error) {
			return res.status(500).json({ error: error.message });
		}
	}

	/**
	 * Busca post por ID
	 * GET /posts/:id
	 * Header: Authorization: Bearer <token> (obrigatório)
	 */
	async getPostById(req, res) {
		try {
			const { id } = req.params;

			const post = await PostService.getPostById(id);

			return res.status(200).json(post);
		} catch (error) {
			if (error.message === 'Post não encontrado') {
				return res.status(404).json({ error: error.message });
			}
			return res.status(500).json({ error: error.message });
		}
	}

	/**
	 * Cria novo post
	 * POST /posts
	 * Body: { title, content, discipline_id, status }
	 * Header: Authorization: Bearer <token> (obrigatório - TEACHER)
	 *
	 * Nota: Validação feita pelo middleware express-validator
	 */
	async createPost(req, res) {
		try {
			// Dados já validados e sanitizados pelo middleware!
			const post = await PostService.createPost(req.body, req.user.id);
			return res.status(201).json(post);
		} catch (error) {
			return res.status(500).json({ error: error.message });
		}
	}

	/**
	 * Atualiza post (SEM ownership check - qualquer TEACHER pode editar)
	 * PUT /posts/:id
	 * Body: { title?, content?, discipline_id?, status? }
	 * Header: Authorization: Bearer <token> (obrigatório - TEACHER)
	 */
	async updatePost(req, res) {
		try {
			const { id } = req.params;
			const data = req.body;

			const post = await PostService.updatePost(id, data);

			return res.status(200).json(post);
		} catch (error) {
			if (error.message === 'Post não encontrado') {
				return res.status(404).json({ error: error.message });
			}

			return res.status(400).json({ error: error.message });
		}
	}

	/**
	 * Deleta post (HARD DELETE - SEM ownership check)
	 * DELETE /posts/:id
	 * Header: Authorization: Bearer <token> (obrigatório - TEACHER)
	 */
	async deletePost(req, res) {
		try {
			const { id } = req.params;

			await PostService.deletePost(id);

			return res.status(204).send();
		} catch (error) {
			if (error.message === 'Post não encontrado') {
				return res.status(404).json({ error: error.message });
			}

			return res.status(500).json({ error: error.message });
		}
	}

	/**
	 * Busca posts com filtros
	 * GET /posts/search?query=teste&title=intro&author=silva&page=1&limit=20
	 * Header: Authorization: Bearer <token> (opcional)
	 */
	async searchPosts(req, res) {
		try {
			const { query, title, author, page, limit } = req.query;
			const userRole = req.user?.role || null;

			const result = await PostService.searchPosts(
				{ query, title, author, page, limit },
				userRole
			);

			return res.status(200).json(result);
		} catch (error) {
			return res.status(500).json({ error: error.message });
		}
	}
}

module.exports = new PostController();
