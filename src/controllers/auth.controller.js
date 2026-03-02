'use strict';

/**
 * AuthController - Controlador de autenticação
 */
class AuthController {
	constructor(authService) {
		this.authService = authService;
	}

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
			const result = await this.authService.login(req.body.email);
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
			await this.authService.logout(sessionId);

			return res.status(204).send();
		} catch (error) {
			return res.status(500).json({ error: error.message });
		}
	}
}

module.exports = AuthController;
