'use strict';

const { validationResult } = require('express-validator');

/**
 * Middleware de validação genérico
 * Processa os erros do express-validator e retorna formato padronizado
 */
const validate = (req, res, next) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(400).json({
			errors: errors.array().map((err) => ({
				field: err.path || err.param,
				message: err.msg
			}))
		});
	}

	next();
};

module.exports = { validate };
