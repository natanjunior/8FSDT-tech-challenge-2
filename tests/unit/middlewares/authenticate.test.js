// Tests for authenticate middleware
// Run with: npm test tests/unit/middlewares/authenticate.test.js

const { createAuthenticate } = require('../../../src/middlewares/authenticate');

describe('authenticate middleware', () => {
	let authenticate;
	let mockAuthService;
	let mockUserSessionRepository;
	let req, res, next;

	beforeEach(() => {
		// Criar mocks das dependências (injetados via factory)
		mockAuthService = {
			verifyToken: jest.fn()
		};

		mockUserSessionRepository = {
			findById: jest.fn(),
			delete: jest.fn()
		};

		// Criar middleware com dependências injetadas
		authenticate = createAuthenticate(mockAuthService, mockUserSessionRepository);

		req = {
			headers: {}
		};
		res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn()
		};
		next = jest.fn();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	test('should authenticate successfully with valid token and session', async () => {
		// Setup
		const mockToken = 'valid.jwt.token';
		const mockDecoded = {
			id: '550e8400-e29b-41d4-a716-446655440001',
			role: 'TEACHER',
			sessionId: '123e4567-e89b-12d3-a456-426614174000'
		};
		const mockSession = {
			id: mockDecoded.sessionId,
			user_id: mockDecoded.id,
			expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // Future date
		};

		req.headers.authorization = `Bearer ${mockToken}`;
		mockAuthService.verifyToken.mockReturnValue(mockDecoded);
		mockUserSessionRepository.findById.mockResolvedValue(mockSession);

		// Execute
		await authenticate(req, res, next);

		// Verify
		expect(mockAuthService.verifyToken).toHaveBeenCalledWith(mockToken);
		expect(mockUserSessionRepository.findById).toHaveBeenCalledWith(mockDecoded.sessionId);
		expect(req.user).toEqual({
			id: mockDecoded.id,
			role: mockDecoded.role,
			sessionId: mockDecoded.sessionId
		});
		expect(next).toHaveBeenCalled();
		expect(res.status).not.toHaveBeenCalled();
	});

	test('should return 401 when Authorization header is missing', async () => {
		// Setup (no authorization header)

		// Execute
		await authenticate(req, res, next);

		// Verify
		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith({ error: 'Token não fornecido' });
		expect(next).not.toHaveBeenCalled();
	});

	test('should return 401 when token is missing in Authorization header', async () => {
		// Setup
		req.headers.authorization = 'Bearer '; // Empty token

		// Execute
		await authenticate(req, res, next);

		// Verify
		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith({ error: 'Token não fornecido' });
		expect(next).not.toHaveBeenCalled();
	});

	test('should return 401 when token is invalid', async () => {
		// Setup
		req.headers.authorization = 'Bearer invalid.token';
		mockAuthService.verifyToken.mockImplementation(() => {
			throw new Error('invalid token');
		});

		// Execute
		await authenticate(req, res, next);

		// Verify
		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido' });
		expect(next).not.toHaveBeenCalled();
	});

	test('should return 401 when session does not exist', async () => {
		// Setup
		const mockToken = 'valid.jwt.token';
		const mockDecoded = {
			id: '550e8400-e29b-41d4-a716-446655440001',
			role: 'TEACHER',
			sessionId: '123e4567-e89b-12d3-a456-426614174000'
		};

		req.headers.authorization = `Bearer ${mockToken}`;
		mockAuthService.verifyToken.mockReturnValue(mockDecoded);
		mockUserSessionRepository.findById.mockResolvedValue(null); // Session not found

		// Execute
		await authenticate(req, res, next);

		// Verify
		expect(mockUserSessionRepository.findById).toHaveBeenCalledWith(mockDecoded.sessionId);
		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith({ error: 'Sessão inválida' });
		expect(next).not.toHaveBeenCalled();
	});

	test('should return 401 and delete session when session is expired', async () => {
		// Setup
		const mockToken = 'valid.jwt.token';
		const mockDecoded = {
			id: '550e8400-e29b-41d4-a716-446655440001',
			role: 'TEACHER',
			sessionId: '123e4567-e89b-12d3-a456-426614174000'
		};
		const mockSession = {
			id: mockDecoded.sessionId,
			user_id: mockDecoded.id,
			expires_at: new Date(Date.now() - 1000) // Past date (expired)
		};

		req.headers.authorization = `Bearer ${mockToken}`;
		mockAuthService.verifyToken.mockReturnValue(mockDecoded);
		mockUserSessionRepository.findById.mockResolvedValue(mockSession);
		mockUserSessionRepository.delete.mockResolvedValue(1);

		// Execute
		await authenticate(req, res, next);

		// Verify
		expect(mockUserSessionRepository.delete).toHaveBeenCalledWith(mockDecoded.sessionId);
		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith({ error: 'Sessão expirada' });
		expect(next).not.toHaveBeenCalled();
	});
});
