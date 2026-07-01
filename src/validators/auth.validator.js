'use strict';

const { body } = require('express-validator');

const loginValidator = [
  body('login')
    .trim()
    .notEmpty()
    .withMessage('Login é obrigatório')
    .isLength({ min: 1, max: 100 })
    .withMessage('Login deve ter entre 1 e 100 caracteres'),
  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória')
    .isLength({ min: 1 })
    .withMessage('Senha não pode estar vazia')
];

const changePasswordValidator = [
  body('current_password')
    .notEmpty()
    .withMessage('Senha atual é obrigatória'),
  body('new_password')
    .notEmpty()
    .withMessage('Nova senha é obrigatória')
    .isLength({ min: 8 })
    .withMessage('Nova senha deve ter no mínimo 8 caracteres')
];

module.exports = { loginValidator, changePasswordValidator };
