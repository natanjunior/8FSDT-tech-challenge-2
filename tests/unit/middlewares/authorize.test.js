// Tests for authorize middleware
// Run with: npm test tests/unit/middlewares/authorize.test.js

const { authorize } = require('../../../src/middlewares/authorize');

describe('authorize middleware', () => {
	let req, res, next;

	beforeEach(() => {
		req = {};
		res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn()
		};
		next = jest.fn();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	test('should authorize TEACHER when TEACHER is allowed', () => {
		// Setup
		req.user = {
			id: '550e8400-e29b-41d4-a716-446655440001',
			role: 'TEACHER',
			sessionId: '123e4567-e89b-12d3-a456-426614174000'
		};

		const middleware = authorize(['TEACHER']);

		// Execute
		middleware(req, res, next);

		// Verify
		expect(next).toHaveBeenCalled();
		expect(res.status).not.toHaveBeenCalled();
	});

	test('should authorize STUDENT when STUDENT is allowed', () => {
		// Setup
		req.user = {
			id: '550e8400-e29b-41d4-a716-446655440003',
			role: 'STUDENT',
			sessionId: '123e4567-e89b-12d3-a456-426614174000'
		};

		const middleware = authorize(['STUDENT']);

		// Execute
		middleware(req, res, next);

		// Verify
		expect(next).toHaveBeenCalled();
		expect(res.status).not.toHaveBeenCalled();
	});

	test('should authorize when role is in allowed roles array', () => {
		// Setup
		req.user = {
			id: '550e8400-e29b-41d4-a716-446655440001',
			role: 'TEACHER',
			sessionId: '123e4567-e89b-12d3-a456-426614174000'
		};

		const middleware = authorize(['TEACHER', 'STUDENT']);

		// Execute
		middleware(req, res, next);

		// Verify
		expect(next).toHaveBeenCalled();
		expect(res.status).not.toHaveBeenCalled();
	});

	test('should deny STUDENT when only TEACHER is allowed', () => {
		// Setup
		req.user = {
			id: '550e8400-e29b-41d4-a716-446655440003',
			role: 'STUDENT',
			sessionId: '123e4567-e89b-12d3-a456-426614174000'
		};

		const middleware = authorize(['TEACHER']);

		// Execute
		middleware(req, res, next);

		// Verify
		expect(res.status).toHaveBeenCalledWith(403);
		expect(res.json).toHaveBeenCalledWith({
			error: 'Acesso negado. Permissão insuficiente.',
			required: ['TEACHER'],
			current: 'STUDENT'
		});
		expect(next).not.toHaveBeenCalled();
	});

	test('should deny TEACHER when only STUDENT is allowed', () => {
		// Setup
		req.user = {
			id: '550e8400-e29b-41d4-a716-446655440001',
			role: 'TEACHER',
			sessionId: '123e4567-e89b-12d3-a456-426614174000'
		};

		const middleware = authorize(['STUDENT']);

		// Execute
		middleware(req, res, next);

		// Verify
		expect(res.status).toHaveBeenCalledWith(403);
		expect(res.json).toHaveBeenCalledWith({
			error: 'Acesso negado. Permissão insuficiente.',
			required: ['STUDENT'],
			current: 'TEACHER'
		});
		expect(next).not.toHaveBeenCalled();
	});

	test('should return 401 when user is not authenticated (req.user missing)', () => {
		// Setup (no req.user)
		const middleware = authorize(['TEACHER']);

		// Execute
		middleware(req, res, next);

		// Verify
		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith({ error: 'Usuário não autenticado' });
		expect(next).not.toHaveBeenCalled();
	});

	test('should work with multiple allowed roles', () => {
		// Setup
		req.user = {
			id: '550e8400-e29b-41d4-a716-446655440003',
			role: 'STUDENT',
			sessionId: '123e4567-e89b-12d3-a456-426614174000'
		};

		const middleware = authorize(['TEACHER', 'STUDENT', 'ADMIN']);

		// Execute
		middleware(req, res, next);

		// Verify
		expect(next).toHaveBeenCalled();
		expect(res.status).not.toHaveBeenCalled();
	});
});
