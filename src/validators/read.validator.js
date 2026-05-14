'use strict';

const { body, query } = require('express-validator');

const createReadValidator = [
  body('post_id')
    .notEmpty()
    .withMessage('post_id é obrigatório')
    .isUUID()
    .withMessage('post_id deve ser um UUID válido')
];

const searchReadsValidator = [
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
    .isInt({ min: 1, max: 100 })
    .withMessage('limit deve ser um número entre 1 e 100')
    .toInt(),

  query('sort')
    .optional()
    .isString()
    .withMessage('sort deve ser uma string')
    .trim()
];

module.exports = { createReadValidator, searchReadsValidator };
