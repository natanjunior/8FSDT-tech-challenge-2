'use strict';

const { body, param, query } = require('express-validator');

const PRONOUNS = ['ele/dele', 'ela/dela', 'elu/delu', 'outro'];
const STATUS = ['ATIVO', 'INATIVO'];

const teacherFieldsValidator = (isCreate) => [
  body('name')
    .if(() => isCreate)
    .notEmpty().withMessage('Nome é obrigatório'),
  body('name').optional().trim().isLength({ min: 1, max: 255 }).withMessage('Nome deve ter entre 1 e 255 caracteres'),
  body('email').optional({ nullable: true }).trim().isEmail().withMessage('Email inválido'),
  body('birth_date').optional({ nullable: true }).isISO8601().withMessage('birth_date deve ser ISO 8601 (YYYY-MM-DD)'),
  body('pronouns').optional({ nullable: true }).isIn(PRONOUNS).withMessage(`pronouns deve ser um de: ${PRONOUNS.join(', ')}`),
  body('biography').optional({ nullable: true }).isString(),
  body('status').optional().isIn(STATUS).withMessage(`status deve ser um de: ${STATUS.join(', ')}`),
  body('discipline_ids').optional({ nullable: true }).isArray().withMessage('discipline_ids deve ser um array'),
  body('discipline_ids.*').optional().isUUID().withMessage('cada discipline_id deve ser UUID'),
  body('user').optional({ nullable: true }).isObject().withMessage('user deve ser objeto'),
  body('user.login').if(body('user').exists()).notEmpty().withMessage('user.login é obrigatório').isLength({ min: 1, max: 100 }),
  body('user.password').if(body('user').exists()).isLength({ min: 8 }).withMessage('user.password deve ter no mínimo 8 caracteres')
];

const createTeacherValidator = teacherFieldsValidator(true);
const updateTeacherValidator = [
  param('id').custom((v) => v.startsWith('Teacher/')).withMessage('ID inválido'),
  ...teacherFieldsValidator(false)
];
const idTeacherValidator = [param('id').custom((v) => v.startsWith('Teacher/')).withMessage('ID inválido')];
const listTeachersValidator = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('sort').optional().isString(),
  query('name').optional().isString(),
  query('status').optional().isIn(STATUS)
];

module.exports = {
  createTeacherValidator,
  updateTeacherValidator,
  idTeacherValidator,
  listTeachersValidator
};
