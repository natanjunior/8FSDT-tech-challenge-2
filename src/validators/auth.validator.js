'use strict';

const { body } = require('express-validator');

/**
 * Validador para login passwordless
 * POST /auth/login
 */
const loginValidator = [
	body('email')
		.trim()
		.notEmpty()
		.withMessage('Email é obrigatório')
		.isEmail()
		.withMessage('Email inválido')
		.normalizeEmail() // Remove pontos do Gmail, converte para lowercase, etc
];

module.exports = {
	loginValidator
};
