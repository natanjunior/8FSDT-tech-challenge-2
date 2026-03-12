'use strict';

const { Op } = require('sequelize');
const { serializePost, serializePosts } = require('../utils/post.serializer');

/**
 * PostService - CRUD de Posts com Visibilidade por Role
 *
 * REGRAS v11:
 * - Hard delete (remoção permanente, SEM deleted_at)
 * - Visibilidade: TEACHER vê todos, STUDENT/null vê apenas PUBLISHED
 * - SEM ownership check (qualquer TEACHER edita/deleta qualquer post)
 */
class PostService {
	constructor(postRepository) {
		this.postRepository = postRepository;
	}
	/**
	 * Lista posts com visibilidade por role
	 * @param {Object} filters - { page, limit }
	 * @param {string|null} userRole - 'TEACHER' | 'STUDENT' | null
	 * @returns {Promise<{data: Array, pagination: Object}>}
	 */
	async listPosts(filters = {}, userRole = null) {
		const page = parseInt(filters.page) || 1;
		const limit = parseInt(filters.limit) || 20;
		const offset = (page - 1) * limit;

		// Construir WHERE clause baseado em role
		const where = {};

		// Visibilidade por role
		if (userRole !== 'TEACHER') {
			// STUDENT ou não autenticado: apenas PUBLISHED
			where.status = 'PUBLISHED';
		}
		// TEACHER: vê todos (sem filtro)

		const { count, rows } = await this.postRepository.findAllPaginated(where, { limit, offset });

		const totalPages = Math.ceil(count / limit);

		return {
			data: serializePosts(rows),
			pagination: {
				page,
				limit,
				total: count,
				totalPages
			}
		};
	}

	/**
	 * Busca post por ID
	 * @param {string} id - UUID do post
	 * @returns {Promise<Object>} Post com includes
	 */
	async getPostById(id) {
		const post = await this.postRepository.findById(id);

		if (!post) {
			throw new Error('Post não encontrado');
		}

		return serializePost(post);
	}

	/**
	 * Cria novo post
	 * @param {Object} data - { title, content, discipline_id, status }
	 * @param {string} userId - UUID do autor
	 * @returns {Promise<Object>} Post criado
	 *
	 * Nota: Validações feitas pelo middleware express-validator
	 */
	async createPost(data, userId) {
		// Dados já validados e sanitizados!
		// Verificar se status é PUBLISHED para definir published_at
		let publishedAt = null;
		if (data.status === 'PUBLISHED') {
			publishedAt = new Date();
		}

		// Criar post
		const post = await this.postRepository.create({
			title: data.title,
			content: data.content,
			author_id: userId,
			discipline_id: data.discipline_id,
			status: data.status || 'DRAFT',
			published_at: publishedAt
		});

		// Retornar com includes
		return await this.getPostById(post.id);
	}

	/**
	 * Atualiza post (SEM ownership check - qualquer TEACHER pode editar)
	 * @param {string} id - UUID do post
	 * @param {Object} data - Campos a atualizar
	 * @returns {Promise<Object>} Post atualizado
	 */
	async updatePost(id, data) {
		const post = await this.postRepository.findById(id);

		if (!post) {
			throw new Error('Post não encontrado');
		}

		// Se alterou status para PUBLISHED e published_at era null
		if (data.status === 'PUBLISHED' && !post.published_at) {
			data.published_at = new Date();
		}

		// Atualizar campos fornecidos
		await this.postRepository.update(id, data);

		// Retornar com includes
		return await this.getPostById(id);
	}

	/**
	 * Delete post (HARD DELETE - SEM ownership check)
	 * @param {string} id - UUID do post
	 * @returns {Promise<void>}
	 */
	async deletePost(id) {
		const post = await this.postRepository.findById(id);

		if (!post) {
			throw new Error('Post não encontrado');
		}

		// HARD DELETE (remoção permanente)
		await this.postRepository.delete(id);
	}

	/**
	 * Busca posts com filtros opcionais e visibilidade por role
	 * @param {Object} filters - { query?, title?, author?, page?, limit? }
	 * @param {string|null} userRole - 'TEACHER' | 'STUDENT' | null
	 * @returns {Promise<{data: Array, pagination: Object}>}
	 */
	async searchPosts(filters = {}, userRole = null) {
		const { query, title, author, page, limit } = filters;

		// Se nenhum parâmetro de busca, chamar listPosts
		if (!query && !title && !author) {
			return await this.listPosts({ page, limit }, userRole);
		}

		const pageNum = parseInt(page) || 1;
		const limitNum = parseInt(limit) || 20;
		const offset = (pageNum - 1) * limitNum;

		// Construir WHERE clause
		const where = {};

		// Filtro de busca por query (título OU conteúdo)
		if (query) {
			where[Op.or] = [
				{ title: { [Op.iLike]: `%${query}%` } },
				{ content: { [Op.iLike]: `%${query}%` } }
			];
		}

		// Filtro por título
		if (title) {
			where.title = { [Op.iLike]: `%${title}%` };
		}

		// Visibilidade por role
		if (userRole !== 'TEACHER') {
			// STUDENT ou não autenticado: apenas PUBLISHED
			where.status = 'PUBLISHED';
		}

		// Filtro por autor
		let authorWhere = null;
		if (author) {
			authorWhere = {
				name: { [Op.iLike]: `%${author}%` }
			};
		}

		const { count, rows } = await this.postRepository.search(where, authorWhere, {
			limit: limitNum,
			offset
		});

		const totalPages = Math.ceil(count / limitNum);

		return {
			data: serializePosts(rows),
			pagination: {
				page: pageNum,
				limit: limitNum,
				total: count,
				totalPages
			}
		};
	}
}

module.exports = PostService;
