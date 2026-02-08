'use strict';

/**
 * Middleware factory de autorização (RBAC)
 * Verifica se o usuário tem uma das roles permitidas
 *
 * @param {string[]} allowedRoles - Array de roles permitidas (ex: ['TEACHER'])
 * @returns {Function} Middleware function
 */
function authorize(allowedRoles) {
	return (req, res, next) => {
		// 1. Verificar se usuário está autenticado
		if (!req.user) {
			return res.status(401).json({ error: 'Usuário não autenticado' });
		}

		// 2. Verificar se a role do usuário está nas roles permitidas
		if (!allowedRoles.includes(req.user.role)) {
			return res.status(403).json({
				error: 'Acesso negado. Permissão insuficiente.',
				required: allowedRoles,
				current: req.user.role
			});
		}

		// 3. Autorizado - prosseguir
		next();
	};
}

module.exports = { authorize };
