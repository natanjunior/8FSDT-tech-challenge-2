'use strict';

const { body, query, param } = require('express-validator');

const searchCommentsValidator = [
  query('post_id').optional().isUUID().withMessage('post_id deve ser um UUID válido'),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  query('sort').optional().isString().trim()
];

const createCommentValidator = [
  body('post_id').notEmpty().withMessage('post_id é obrigatório').isUUID().withMessage('post_id deve ser UUID'),
  body('content').trim().notEmpty().withMessage('content é obrigatório').isLength({ min: 1, max: 1000 })
];

const deleteCommentValidator = [
  param('id').isUUID().withMessage('ID do comentário deve ser UUID')
];

module.exports = { searchCommentsValidator, createCommentValidator, deleteCommentValidator };
