'use strict';

const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { User, UserSession } = require('../models');

/**
 * AuthService - Passwordless Authentication
 * Login apenas com email (SEM password!)
 */
class AuthService {
	/**
	 * Login passwordless - apenas com email
	 * @param {string} email - Email do usuário
	 * @returns {Promise<{user: Object, token: string}>}
	 */
	async login(email) {
		// Buscar usuário por email
		const user = await User.findOne({ where: { email } });

		if (!user) {
			throw new Error('Email não cadastrado');
		}

		// Gerar sessionId único
		const sessionId = uuidv4();

		// Calcular expiração (24 horas)
		const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

		// Criar payload JWT com id, role e sessionId
		const payload = {
			id: user.id,
			role: user.role,
			sessionId
		};

		// Gerar token JWT
		const token = this.generateToken(payload);

		// Salvar sessão no banco
		await UserSession.create({
			id: sessionId,
			user_id: user.id,
			session_token: token,
			expires_at: expiresAt
		});

		// Retornar usuário (sem dados sensíveis) + token
		return {
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role
			},
			token
		};
	}

	/**
	 * Logout - remove sessão do banco
	 * @param {string} sessionId - ID da sessão a ser removida
	 * @returns {Promise<void>}
	 */
	async logout(sessionId) {
		await UserSession.destroy({
			where: { id: sessionId }
		});
	}

	/**
	 * Gera token JWT
	 * @param {Object} payload - Dados a serem incluídos no token
	 * @returns {string} Token JWT
	 */
	generateToken(payload) {
		return jwt.sign(payload, process.env.JWT_SECRET, {
			expiresIn: '24h'
		});
	}

	/**
	 * Verifica e decodifica token JWT
	 * @param {string} token - Token JWT a ser verificado
	 * @returns {Object} Payload decodificado { id, role, sessionId }
	 */
	verifyToken(token) {
		return jwt.verify(token, process.env.JWT_SECRET);
	}
}

module.exports = new AuthService();
