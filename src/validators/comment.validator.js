'use strict';

const { body, query, param } = require('express-validator');

const searchCommentsValidator = [
  query('post_id')
    .optional()
    .isUUID()
    .withMessage('post_id deve ser um UUID válido'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page deve ser um número inteiro >= 1')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('limit deve ser um número entre 1 e 50')
    .toInt(),

  query('sort')
    .optional()
    .isString()
    .withMessage('sort deve ser uma string')
    .trim()
];

const createCommentValidator = [
  body('post_id')
    .notEmpty()
    .withMessage('post_id é obrigatório')
    .isUUID()
    .withMessage('post_id deve ser um UUID válido'),

  body('content')
    .trim()
    .notEmpty()
    .withMessage('content é obrigatório')
    .isLength({ min: 1, max: 1000 })
    .withMessage('content deve ter entre 1 e 1000 caracteres'),

  body('author_name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('author_name deve ter no máximo 100 caracteres')
];

const deleteCommentValidator = [
  param('id').isUUID().withMessage('ID do comentário deve ser um UUID válido')
];

module.exports = {
  searchCommentsValidator,
  createCommentValidator,
  deleteCommentValidator
};
