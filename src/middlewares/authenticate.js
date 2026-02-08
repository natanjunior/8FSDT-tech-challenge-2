'use strict';

const AuthService = require('../services/auth.service');
const { UserSession } = require('../models');

/**
 * Middleware de autenticação
 * Verifica token JWT e valida sessão no banco
 */
async function authenticate(req, res, next) {
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
		const decoded = AuthService.verifyToken(token);

		// 4. Buscar sessão no banco
		const session = await UserSession.findByPk(decoded.sessionId);

		if (!session) {
			return res.status(401).json({ error: 'Sessão inválida' });
		}

		// 5. Verificar expiração da sessão
		if (new Date() > session.expires_at) {
			// Deletar sessão expirada
			await session.destroy();
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
}

module.exports = { authenticate };
