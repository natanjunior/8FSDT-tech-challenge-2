'use strict';

const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

/**
 * AuthService - Passwordless Authentication
 * Login apenas com email (SEM password!)
 */
class AuthService {
	constructor(userRepository, userSessionRepository) {
		this.userRepository = userRepository;
		this.userSessionRepository = userSessionRepository;
	}
	/**
	 * Login passwordless - apenas com email
	 * @param {string} email - Email do usuário
	 * @returns {Promise<{user: Object, token: string}>}
	 */
	async login(email) {
		// Buscar usuário por email
		const user = await this.userRepository.findByEmail(email);

		if (!user) {
			throw new Error('Email não cadastrado');
		}

		// Gerar sessionId único
		const sessionId = uuidv4();

		// Calcular expiração baseada em JWT_EXPIRES_IN
		const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
		const expiresAt = new Date(Date.now() + this._parseExpiresIn(expiresIn));

		// Criar payload JWT com id, role e sessionId
		const payload = {
			id: user.id,
			role: user.role,
			sessionId
		};

		// Gerar token JWT
		const token = this.generateToken(payload);

		// Salvar sessão no banco
		await this.userSessionRepository.create({
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
		await this.userSessionRepository.delete(sessionId);
	}

	/**
	 * Gera token JWT
	 * @param {Object} payload - Dados a serem incluídos no token
	 * @returns {string} Token JWT
	 */
	generateToken(payload) {
		return jwt.sign(payload, process.env.JWT_SECRET, {
			expiresIn: process.env.JWT_EXPIRES_IN || '24h'
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

	/**
	 * Converte string de duração (ex: '24h', '7d', '30m') em milissegundos
	 * @param {string} duration - String de duração
	 * @returns {number} Duração em milissegundos
	 */
	_parseExpiresIn(duration) {
		const match = duration.match(/^(\d+)(s|m|h|d)$/);
		if (!match) return 24 * 60 * 60 * 1000; // fallback 24h

		const value = parseInt(match[1]);
		const unit = match[2];

		const multipliers = {
			's': 1000,
			'm': 60 * 1000,
			'h': 60 * 60 * 1000,
			'd': 24 * 60 * 60 * 1000
		};

		return value * multipliers[unit];
	}
}

module.exports = AuthService;
