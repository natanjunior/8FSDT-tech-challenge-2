'use strict';

/**
 * Factory de middleware de autenticação
 * Recebe dependências via parâmetro (Dependency Injection)
 * @param {Object} authService - Instância de AuthService
 * @param {Object} userSessionRepository - Instância de UserSessionRepository
 * @returns {Function} Middleware de autenticação
 */
function createAuthenticate(authService, userSessionRepository) {
	return async function authenticate(req, res, next) {
		try {
			// 1. Extrair Authorization header
			const authHeader = req.headers.authorization;

			if (!authHeader) {
				return res.status(401).json({ error: 'Token não fornecido' });
			}

			// 2. Extrair token (formato: "Bearer token")
			const token = authHeader.split(' ')[1];

			if (!token) {
				return res.status(401).json({ error: 'Token não fornecido' });
			}

			// 3. Verificar token JWT
			const decoded = authService.verifyToken(token);

			// 4. Buscar sessão no banco
			const session = await userSessionRepository.findById(decoded.sessionId);

			if (!session) {
				return res.status(401).json({ error: 'Sessão inválida' });
			}

			// 5. Verificar expiração da sessão
			if (new Date() > session.expires_at) {
				// Deletar sessão expirada
				await userSessionRepository.delete(decoded.sessionId);
				return res.status(401).json({ error: 'Sessão expirada' });
			}

			// 6. Adicionar dados do usuário à requisição
			req.user = {
				id: decoded.id,
				role: decoded.role,
				sessionId: decoded.sessionId
			};

			next();
		} catch (error) {
			return res.status(401).json({ error: 'Token inválido' });
		}
	};
}

module.exports = { createAuthenticate };
