'use strict';

const AuthService = require('../services/auth.service');

/**
 * AuthController - Controlador de autenticação
 */
class AuthController {
	/**
	 * Login passwordless (apenas com email)
	 * POST /auth/login
	 * Body: { email }
	 *
	 * Nota: Validação feita pelo middleware express-validator
	 */
	async login(req, res) {
		try {
			// Email já validado e normalizado pelo middleware!
			const result = await AuthService.login(req.body.email);
			return res.status(200).json(result);
		} catch (error) {
			// Email não cadastrado
			if (error.message === 'Email não cadastrado') {
				return res.status(404).json({ error: error.message });
			}

			// Outros erros
			return res.status(500).json({ error: error.message });
		}
	}

	/**
	 * Logout - remove sessão
	 * POST /auth/logout
	 * Requer: authenticate middleware (req.user.sessionId)
	 */
	async logout(req, res) {
		try {
			const { sessionId } = req.user;

			// Chamar service
			await AuthService.logout(sessionId);

			return res.status(204).send();
		} catch (error) {
			return res.status(500).json({ error: error.message });
		}
	}
}

module.exports = new AuthController();
