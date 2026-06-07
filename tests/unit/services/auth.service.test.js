// Tests for AuthService (Fase 4 - login + password, profiles, FHIR refs)
// Run with: npm test tests/unit/services/auth.service.test.js

const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// Mock apenas bibliotecas externas (não dependências internas)
jest.mock('jsonwebtoken');
jest.mock('uuid');

const AuthService = require('../../../src/services/auth.service');

describe('AuthService - login + password', () => {
	let authService;
	let mockUserRepository;
	let mockUserSessionRepository;
	let mockTeacherRepository;
	let mockStudentRepository;

	beforeAll(() => {
		process.env.JWT_SECRET = 'test-secret';
	});

	beforeEach(() => {
		delete process.env.JWT_EXPIRES_IN;

		// Criar mocks via objetos simples (injetados no constructor)
		mockUserRepository = {
			findByLogin: jest.fn(),
			verifyPassword: jest.fn(),
			findById: jest.fn(),
			updatePasswordHash: jest.fn()
		};

		mockUserSessionRepository = {
			create: jest.fn(),
			findById: jest.fn(),
			delete: jest.fn()
		};

		mockTeacherRepository = {
			findByUserId: jest.fn()
		};

		mockStudentRepository = {
			findByUserId: jest.fn()
		};

		// Instanciar service com dependências injetadas (4 repos)
		authService = new AuthService(
			mockUserRepository,
			mockUserSessionRepository,
			mockTeacherRepository,
			mockStudentRepository
		);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('login()', () => {
		const mockUser = {
			id: '550e8400-e29b-41d4-a716-446655440001',
			login: 'joao.silva',
			password_hash: '$2b$10$hashedpassword',
			role: 'TEACHER'
		};

		const mockTeacherProfile = {
			id: 'Teacher/abc-123',
			name: 'Prof. João Silva',
			email: 'joao.silva@escola.com',
			pronouns: 'ele/dele',
			status: 'ATIVO',
			disciplines: [{ id: 'd1', label: 'Matemática' }]
		};

		const mockSessionId = '123e4567-e89b-12d3-a456-426614174000';
		const mockToken = 'mock.jwt.token';

		test('should login successfully with valid credentials', async () => {
			mockUserRepository.findByLogin.mockResolvedValue(mockUser);
			mockUserRepository.verifyPassword.mockResolvedValue(true);
			mockTeacherRepository.findByUserId.mockResolvedValue(mockTeacherProfile);
			uuidv4.mockReturnValue(mockSessionId);
			jwt.sign.mockReturnValue(mockToken);
			mockUserSessionRepository.create.mockResolvedValue({});

			const result = await authService.login('joao.silva', 'senha123');

			expect(mockUserRepository.findByLogin).toHaveBeenCalledWith('joao.silva');
			expect(mockUserRepository.verifyPassword).toHaveBeenCalledWith('senha123', mockUser.password_hash);
			expect(mockTeacherRepository.findByUserId).toHaveBeenCalledWith(mockUser.id);
			expect(uuidv4).toHaveBeenCalled();
			expect(jwt.sign).toHaveBeenCalledWith(
				{
					id: mockUser.id,
					role: mockUser.role,
					sessionId: mockSessionId,
					profileId: mockTeacherProfile.id
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
					login: mockUser.login,
					role: mockUser.role
				},
				profile: expect.objectContaining({
					id: mockTeacherProfile.id,
					name: mockTeacherProfile.name,
					disciplines: [{ id: 'd1', label: 'Matemática' }]
				}),
				token: mockToken
			});
		});

		test('should resolve STUDENT profile via studentRepository', async () => {
			const studentUser = { ...mockUser, role: 'STUDENT', login: 'aluno' };
			const studentProfile = {
				id: 'Student/xyz-789',
				name: 'Aluno Teste',
				status: 'ATIVO',
				course: 'Engenharia'
			};
			mockUserRepository.findByLogin.mockResolvedValue(studentUser);
			mockUserRepository.verifyPassword.mockResolvedValue(true);
			mockStudentRepository.findByUserId.mockResolvedValue(studentProfile);
			uuidv4.mockReturnValue(mockSessionId);
			jwt.sign.mockReturnValue(mockToken);
			mockUserSessionRepository.create.mockResolvedValue({});

			const result = await authService.login('aluno', 'senha123');

			expect(mockStudentRepository.findByUserId).toHaveBeenCalledWith(studentUser.id);
			expect(result.profile).toEqual(
				expect.objectContaining({ id: studentProfile.id, course: 'Engenharia' })
			);
			expect(result.user.role).toBe('STUDENT');
		});

		test('should throw 401 for non-existent login', async () => {
			mockUserRepository.findByLogin.mockResolvedValue(null);
			mockUserRepository.verifyPassword.mockResolvedValue(false);

			await expect(authService.login('invalid', 'x')).rejects.toThrow('Credenciais inválidas');
			expect(mockUserRepository.findByLogin).toHaveBeenCalledWith('invalid');
			// dummy compare for constant-time mitigation
			expect(mockUserRepository.verifyPassword).toHaveBeenCalled();
			expect(mockUserSessionRepository.create).not.toHaveBeenCalled();
		});

		test('should throw 401 for wrong password', async () => {
			mockUserRepository.findByLogin.mockResolvedValue(mockUser);
			mockUserRepository.verifyPassword.mockResolvedValue(false);

			await expect(authService.login('joao.silva', 'wrong')).rejects.toThrow('Credenciais inválidas');
			expect(mockUserSessionRepository.create).not.toHaveBeenCalled();
		});

		test('should throw 401 when profile is INATIVO', async () => {
			mockUserRepository.findByLogin.mockResolvedValue(mockUser);
			mockUserRepository.verifyPassword.mockResolvedValue(true);
			mockTeacherRepository.findByUserId.mockResolvedValue({
				...mockTeacherProfile,
				status: 'INATIVO'
			});

			await expect(authService.login('joao.silva', 'senha123')).rejects.toThrow('Usuário inativo');
			expect(mockUserSessionRepository.create).not.toHaveBeenCalled();
		});

		test('login error should carry status 401', async () => {
			mockUserRepository.findByLogin.mockResolvedValue(null);
			mockUserRepository.verifyPassword.mockResolvedValue(false);

			await expect(authService.login('x', 'y')).rejects.toMatchObject({ status: 401 });
		});
	});

	describe('logout()', () => {
		test('should delete session successfully', async () => {
			const mockSessionId = '123e4567-e89b-12d3-a456-426614174000';

			mockUserSessionRepository.delete.mockResolvedValue(1);

			await authService.logout(mockSessionId);

			expect(mockUserSessionRepository.delete).toHaveBeenCalledWith(mockSessionId);
		});
	});

	describe('changePassword()', () => {
		const userId = '550e8400-e29b-41d4-a716-446655440001';
		const userWithHash = { id: userId, login: 'joao', password_hash: '$2b$10$old' };

		test('should update password when current password is correct', async () => {
			mockUserRepository.findById.mockResolvedValue({ id: userId, login: 'joao' });
			mockUserRepository.findByLogin.mockResolvedValue(userWithHash);
			mockUserRepository.verifyPassword.mockResolvedValue(true);
			mockUserRepository.updatePasswordHash.mockResolvedValue([1]);

			await authService.changePassword(userId, 'oldpass', 'newpass');

			expect(mockUserRepository.verifyPassword).toHaveBeenCalledWith('oldpass', userWithHash.password_hash);
			expect(mockUserRepository.updatePasswordHash).toHaveBeenCalledWith(userId, 'newpass');
		});

		test('should throw 400 when current password is wrong', async () => {
			mockUserRepository.findById.mockResolvedValue({ id: userId, login: 'joao' });
			mockUserRepository.findByLogin.mockResolvedValue(userWithHash);
			mockUserRepository.verifyPassword.mockResolvedValue(false);

			await expect(
				authService.changePassword(userId, 'wrong', 'newpass')
			).rejects.toThrow('Senha atual incorreta');
			expect(mockUserRepository.updatePasswordHash).not.toHaveBeenCalled();
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

			const token = authService.generateToken(mockPayload);

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
			login: 'joao.silva',
			password_hash: '$2b$10$hashedpassword',
			role: 'TEACHER'
		};
		const mockProfile = { id: 'Teacher/abc', name: 'Prof', status: 'ATIVO' };

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

			mockUserRepository.findByLogin.mockResolvedValue(mockUser);
			mockUserRepository.verifyPassword.mockResolvedValue(true);
			mockTeacherRepository.findByUserId.mockResolvedValue(mockProfile);
			uuidv4.mockReturnValue(mockSessionId);
			jwt.sign.mockReturnValue(mockToken);
			mockUserSessionRepository.create.mockResolvedValue({});

			const before = Date.now();
			await authService.login('joao.silva', 'senha123');
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
				sessionId: '123e4567-e89b-12d3-a456-426614174000',
				profileId: 'Teacher/abc'
			};

			jwt.verify.mockReturnValue(mockDecoded);

			const decoded = authService.verifyToken(mockToken);

			expect(jwt.verify).toHaveBeenCalledWith(mockToken, 'test-secret');
			expect(decoded).toEqual(mockDecoded);
		});

		test('should throw error for invalid token', () => {
			const mockToken = 'invalid.token';
			const error = new Error('invalid token');

			jwt.verify.mockImplementation(() => {
				throw error;
			});

			expect(() => authService.verifyToken(mockToken)).toThrow('invalid token');
			expect(jwt.verify).toHaveBeenCalledWith(mockToken, 'test-secret');
		});
	});
});
