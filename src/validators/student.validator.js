'use strict';

const { body, param, query } = require('express-validator');

const PRONOUNS = ['ele/dele', 'ela/dela', 'elu/delu', 'outro'];
const STATUS = ['ATIVO', 'INATIVO'];

const studentFieldsValidator = (isCreate) => [
  body('name').if(() => isCreate).notEmpty().withMessage('Nome é obrigatório'),
  body('name').optional().trim().isLength({ min: 1, max: 255 }),
  body('email').optional({ nullable: true }).trim().isEmail().withMessage('Email inválido'),
  body('birth_date').optional({ nullable: true }).isISO8601(),
  body('pronouns').optional({ nullable: true }).isIn(PRONOUNS),
  body('biography').optional({ nullable: true }).isString(),
  body('status').optional().isIn(STATUS),
  body('course').optional({ nullable: true }).isString().isLength({ max: 255 }),
  body('user').optional({ nullable: true }).isObject(),
  body('user.login').if(body('user').exists()).notEmpty().isLength({ min: 1, max: 100 }),
  body('user.password').if(body('user').exists()).isLength({ min: 8 })
];

module.exports = {
  createStudentValidator: studentFieldsValidator(true),
  updateStudentValidator: [
    param('id').custom((v) => v.startsWith('Student/')).withMessage('ID inválido'),
    ...studentFieldsValidator(false)
  ],
  idStudentValidator: [param('id').custom((v) => v.startsWith('Student/')).withMessage('ID inválido')],
  listStudentsValidator: [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('sort').optional().isString(),
    query('name').optional().isString(),
    query('status').optional().isIn(STATUS)
  ]
};
