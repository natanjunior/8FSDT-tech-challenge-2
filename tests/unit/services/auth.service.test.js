// Tests for AuthService (Passwordless Authentication)
// Run with: npm test tests/unit/services/auth.service.test.js

const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('uuid');
jest.mock('../../../src/repositories/user.repository');
jest.mock('../../../src/repositories/userSession.repository');

const AuthService = require('../../../src/services/auth.service');
const UserRepository = require('../../../src/repositories/user.repository');
const UserSessionRepository = require('../../../src/repositories/userSession.repository');

describe('AuthService - Passwordless Authentication', () => {
	// Mock environment variable
	beforeAll(() => {
		process.env.JWT_SECRET = 'test-secret';
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('login()', () => {
		const mockUser = {
			id: '550e8400-e29b-41d4-a716-446655440001',
			name: 'Prof. João Silva',
			email: 'joao.silva@escola.com',
			role: 'TEACHER'
		};

		const mockSessionId = '123e4567-e89b-12d3-a456-426614174000';
		const mockToken = 'mock.jwt.token';

		test('should login successfully with valid email', async () => {
			// Setup mocks
			UserRepository.findByEmail.mockResolvedValue(mockUser);
			uuidv4.mockReturnValue(mockSessionId);
			jwt.sign.mockReturnValue(mockToken);
			UserSessionRepository.create.mockResolvedValue({});

			// Execute
			const result = await AuthService.login('joao.silva@escola.com');

			// Verify
			expect(UserRepository.findByEmail).toHaveBeenCalledWith('joao.silva@escola.com');
			expect(uuidv4).toHaveBeenCalled();
			expect(jwt.sign).toHaveBeenCalledWith(
				{
					id: mockUser.id,
					role: mockUser.role,
					sessionId: mockSessionId
				},
				'test-secret',
				{ expiresIn: '24h' }
			);
			expect(UserSessionRepository.create).toHaveBeenCalledWith(
				expect.objectContaining({
					id: mockSessionId,
					user_id: mockUser.id,
					session_token: mockToken
				})
			);
			expect(result).toEqual({
				user: {
					id: mockUser.id,
					name: mockUser.name,
					email: mockUser.email,
					role: mockUser.role
				},
				token: mockToken
			});
		});

		test('should throw error for non-existent email', async () => {
			// Setup mock
			UserRepository.findByEmail.mockResolvedValue(null);

			// Execute & Verify
			await expect(AuthService.login('invalid@email.com')).rejects.toThrow(
				'Email não cadastrado'
			);
			expect(UserRepository.findByEmail).toHaveBeenCalledWith('invalid@email.com');
			expect(UserSessionRepository.create).not.toHaveBeenCalled();
		});

		test('should return user without sensitive data', async () => {
			// Setup mocks
			UserRepository.findByEmail.mockResolvedValue(mockUser);
			uuidv4.mockReturnValue(mockSessionId);
			jwt.sign.mockReturnValue(mockToken);
			UserSessionRepository.create.mockResolvedValue({});

			// Execute
			const result = await AuthService.login('joao.silva@escola.com');

			// Verify user object doesn't contain password or other sensitive data
			expect(result.user).toEqual({
				id: mockUser.id,
				name: mockUser.name,
				email: mockUser.email,
				role: mockUser.role
			});
		});
	});

	describe('logout()', () => {
		test('should delete session successfully', async () => {
			const mockSessionId = '123e4567-e89b-12d3-a456-426614174000';

			// Mock delete method
			UserSessionRepository.delete.mockResolvedValue(1);

			// Execute
			await AuthService.logout(mockSessionId);

			// Verify
			expect(UserSessionRepository.delete).toHaveBeenCalledWith(mockSessionId);
		});
	});

	describe('generateToken()', () => {
		test('should generate JWT token with correct payload', () => {
			const mockPayload = {
				id: '550e8400-e29b-41d4-a716-446655440001',
				role: 'TEACHER',
				sessionId: '123e4567-e89b-12d3-a456-426614174000'
			};
			const mockToken = 'mock.jwt.token';

			jwt.sign.mockReturnValue(mockToken);

			// Execute
			const token = AuthService.generateToken(mockPayload);

			// Verify
			expect(jwt.sign).toHaveBeenCalledWith(mockPayload, 'test-secret', {
				expiresIn: '24h'
			});
			expect(token).toBe(mockToken);
		});
	});

	describe('verifyToken()', () => {
		test('should verify and decode valid token', () => {
			const mockToken = 'mock.jwt.token';
			const mockDecoded = {
				id: '550e8400-e29b-41d4-a716-446655440001',
				role: 'TEACHER',
				sessionId: '123e4567-e89b-12d3-a456-426614174000'
			};

			jwt.verify.mockReturnValue(mockDecoded);

			// Execute
			const decoded = AuthService.verifyToken(mockToken);

			// Verify
			expect(jwt.verify).toHaveBeenCalledWith(mockToken, 'test-secret');
			expect(decoded).toEqual(mockDecoded);
		});

		test('should throw error for invalid token', () => {
			const mockToken = 'invalid.token';
			const error = new Error('invalid token');

			jwt.verify.mockImplementation(() => {
				throw error;
			});

			// Execute & Verify
			expect(() => AuthService.verifyToken(mockToken)).toThrow('invalid token');
			expect(jwt.verify).toHaveBeenCalledWith(mockToken, 'test-secret');
		});
	});
});
