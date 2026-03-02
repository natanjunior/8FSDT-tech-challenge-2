// Tests for AuthService (Passwordless Authentication)
// Run with: npm test tests/unit/services/auth.service.test.js

const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// Mock apenas bibliotecas externas (não dependências internas)
jest.mock('jsonwebtoken');
jest.mock('uuid');

const AuthService = require('../../../src/services/auth.service');

describe('AuthService - Passwordless Authentication', () => {
	let authService;
	let mockUserRepository;
	let mockUserSessionRepository;

	beforeAll(() => {
		process.env.JWT_SECRET = 'test-secret';
	});

	beforeEach(() => {
		delete process.env.JWT_EXPIRES_IN;

		// Criar mocks via objetos simples (injetados no constructor)
		mockUserRepository = {
			findByEmail: jest.fn()
		};

		mockUserSessionRepository = {
			create: jest.fn(),
			findById: jest.fn(),
			delete: jest.fn()
		};

		// Instanciar service com dependências injetadas
		authService = new AuthService(mockUserRepository, mockUserSessionRepository);
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
			mockUserRepository.findByEmail.mockResolvedValue(mockUser);
			uuidv4.mockReturnValue(mockSessionId);
			jwt.sign.mockReturnValue(mockToken);
			mockUserSessionRepository.create.mockResolvedValue({});

			// Execute
			const result = await authService.login('joao.silva@escola.com');

			// Verify
			expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('joao.silva@escola.com');
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
			expect(mockUserSessionRepository.create).toHaveBeenCalledWith(
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
			mockUserRepository.findByEmail.mockResolvedValue(null);

			// Execute & Verify
			await expect(authService.login('invalid@email.com')).rejects.toThrow(
				'Email não cadastrado'
			);
			expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('invalid@email.com');
			expect(mockUserSessionRepository.create).not.toHaveBeenCalled();
		});

		test('should return user without sensitive data', async () => {
			// Setup mocks
			mockUserRepository.findByEmail.mockResolvedValue(mockUser);
			uuidv4.mockReturnValue(mockSessionId);
			jwt.sign.mockReturnValue(mockToken);
			mockUserSessionRepository.create.mockResolvedValue({});

			// Execute
			const result = await authService.login('joao.silva@escola.com');

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
			mockUserSessionRepository.delete.mockResolvedValue(1);

			// Execute
			await authService.logout(mockSessionId);

			// Verify
			expect(mockUserSessionRepository.delete).toHaveBeenCalledWith(mockSessionId);
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
			const token = authService.generateToken(mockPayload);

			// Verify
			expect(jwt.sign).toHaveBeenCalledWith(mockPayload, 'test-secret', {
				expiresIn: '24h'
			});
			expect(token).toBe(mockToken);
		});
	});

	describe('_parseExpiresIn()', () => {
		test('should parse seconds correctly', () => {
			expect(authService._parseExpiresIn('30s')).toBe(30 * 1000);
		});

		test('should parse minutes correctly', () => {
			expect(authService._parseExpiresIn('15m')).toBe(15 * 60 * 1000);
		});

		test('should parse hours correctly', () => {
			expect(authService._parseExpiresIn('24h')).toBe(24 * 60 * 60 * 1000);
		});

		test('should parse days correctly', () => {
			expect(authService._parseExpiresIn('7d')).toBe(7 * 24 * 60 * 60 * 1000);
		});

		test('should fallback to 24h for invalid format', () => {
			expect(authService._parseExpiresIn('invalid')).toBe(24 * 60 * 60 * 1000);
		});

		test('should fallback to 24h for empty string', () => {
			expect(authService._parseExpiresIn('')).toBe(24 * 60 * 60 * 1000);
		});
	});

	describe('JWT_EXPIRES_IN environment variable', () => {
		const mockUser = {
			id: '550e8400-e29b-41d4-a716-446655440001',
			name: 'Prof. João Silva',
			email: 'joao.silva@escola.com',
			role: 'TEACHER'
		};

		const mockSessionId = '123e4567-e89b-12d3-a456-426614174000';
		const mockToken = 'mock.jwt.token';

		test('should use JWT_EXPIRES_IN env var for token generation', () => {
			process.env.JWT_EXPIRES_IN = '7d';
			jwt.sign.mockReturnValue(mockToken);

			authService.generateToken({ id: mockUser.id, role: mockUser.role });

			expect(jwt.sign).toHaveBeenCalledWith(
				expect.any(Object),
				'test-secret',
				{ expiresIn: '7d' }
			);
		});

		test('should use JWT_EXPIRES_IN env var for session expiration', async () => {
			process.env.JWT_EXPIRES_IN = '7d';

			mockUserRepository.findByEmail.mockResolvedValue(mockUser);
			uuidv4.mockReturnValue(mockSessionId);
			jwt.sign.mockReturnValue(mockToken);
			mockUserSessionRepository.create.mockResolvedValue({});

			const before = Date.now();
			await authService.login('joao.silva@escola.com');
			const after = Date.now();

			const createCall = mockUserSessionRepository.create.mock.calls[0][0];
			const expiresAt = new Date(createCall.expires_at).getTime();
			const expectedMs = 7 * 24 * 60 * 60 * 1000;

			expect(expiresAt).toBeGreaterThanOrEqual(before + expectedMs);
			expect(expiresAt).toBeLessThanOrEqual(after + expectedMs);
		});

		test('should default to 24h when JWT_EXPIRES_IN is not set', () => {
			delete process.env.JWT_EXPIRES_IN;
			jwt.sign.mockReturnValue(mockToken);

			authService.generateToken({ id: mockUser.id, role: mockUser.role });

			expect(jwt.sign).toHaveBeenCalledWith(
				expect.any(Object),
				'test-secret',
				{ expiresIn: '24h' }
			);
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
			const decoded = authService.verifyToken(mockToken);

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
			expect(() => authService.verifyToken(mockToken)).toThrow('invalid token');
			expect(jwt.verify).toHaveBeenCalledWith(mockToken, 'test-secret');
		});
	});
});
