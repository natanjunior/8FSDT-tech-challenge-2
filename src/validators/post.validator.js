'use strict';

const { body, param, query } = require('express-validator');

/**
 * Validador para criação de posts
 * POST /posts
 */
const createPostValidator = [
	body('title')
		.trim()
		.notEmpty()
		.withMessage('Título é obrigatório')
		.isLength({ min: 5, max: 255 })
		.withMessage('Título deve ter entre 5 e 255 caracteres'),

	body('content')
		.trim()
		.notEmpty()
		.withMessage('Conteúdo é obrigatório')
		.isLength({ min: 10 })
		.withMessage('Conteúdo deve ter no mínimo 10 caracteres'),

	body('status')
		.optional()
		.isIn(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
		.withMessage('Status deve ser DRAFT, PUBLISHED ou ARCHIVED')
		.customSanitizer((value) => value?.toUpperCase()),

	body('discipline_id')
		.optional()
		.isUUID()
		.withMessage('discipline_id deve ser um UUID válido')
];

/**
 * Validador para atualização de posts
 * PUT /posts/:id
 */
const updatePostValidator = [
	param('id').isUUID().withMessage('ID do post deve ser um UUID válido'),

	body('title')
		.optional()
		.trim()
		.isLength({ min: 5, max: 255 })
		.withMessage('Título deve ter entre 5 e 255 caracteres'),

	body('content')
		.optional()
		.trim()
		.isLength({ min: 10 })
		.withMessage('Conteúdo deve ter no mínimo 10 caracteres'),

	body('status')
		.optional()
		.isIn(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
		.withMessage('Status deve ser DRAFT, PUBLISHED ou ARCHIVED')
		.customSanitizer((value) => value?.toUpperCase()),

	body('discipline_id')
		.optional()
		.isUUID()
		.withMessage('discipline_id deve ser um UUID válido')
];

/**
 * Validador para buscar post por ID
 * GET /posts/:id
 */
const getPostValidator = [
	param('id').isUUID().withMessage('ID do post deve ser um UUID válido')
];

/**
 * Validador para deletar post
 * DELETE /posts/:id
 */
const deletePostValidator = [
	param('id').isUUID().withMessage('ID do post deve ser um UUID válido')
];

/**
 * Validador para listagem de posts
 * GET /posts?page=1&limit=20
 */
const listPostsValidator = [
	query('page')
		.optional()
		.isInt({ min: 1 })
		.withMessage('page deve ser um número inteiro >= 1')
		.toInt(),

	query('limit')
		.optional()
		.isInt({ min: 1, max: 100 })
		.withMessage('limit deve ser um número entre 1 e 100')
		.toInt()
];

/**
 * Validador para busca de posts
 * GET /posts/search?query=teste&title=intro&author=silva&page=1&limit=20
 */
const searchPostsValidator = [
	query('query')
		.optional()
		.trim()
		.isLength({ min: 2 })
		.withMessage('query deve ter no mínimo 2 caracteres'),

	query('title')
		.optional()
		.trim()
		.isLength({ min: 2 })
		.withMessage('title deve ter no mínimo 2 caracteres'),

	query('author')
		.optional()
		.trim()
		.isLength({ min: 2 })
		.withMessage('author deve ter no mínimo 2 caracteres'),

	query('page')
		.optional()
		.isInt({ min: 1 })
		.withMessage('page deve ser um número inteiro >= 1')
		.toInt(),

	query('limit')
		.optional()
		.isInt({ min: 1, max: 100 })
		.withMessage('limit deve ser um número entre 1 e 100')
		.toInt()
];

module.exports = {
	createPostValidator,
	updatePostValidator,
	getPostValidator,
	deletePostValidator,
	listPostsValidator,
	searchPostsValidator
};
