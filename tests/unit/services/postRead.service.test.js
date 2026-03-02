// Tests for PostReadService (FASE 5 - Post Reads)
// Run with: npm test tests/unit/services/postRead.service.test.js

const PostReadService = require('../../../src/services/postRead.service');

describe('PostReadService - Post Reads', () => {
	let postReadService;
	let mockPostRepository;
	let mockPostReadRepository;

	beforeEach(() => {
		// Criar mocks dos repositórios (injetados no constructor)
		mockPostRepository = {
			findById: jest.fn()
		};

		mockPostReadRepository = {
			findByPostAndUser: jest.fn(),
			create: jest.fn()
		};

		// Instanciar service com dependências injetadas
		postReadService = new PostReadService(mockPostRepository, mockPostReadRepository);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('markAsRead()', () => {
		const postId = 'post-uuid-123';
		const userId = 'user-uuid-456';

		test('should create new read record if not exists', async () => {
			const mockPost = { id: postId, title: 'Test Post' };
			const mockNewRead = {
				id: 'read-uuid-789',
				post_id: postId,
				user_id: userId,
				read_at: new Date('2024-01-01T10:00:00Z')
			};

			mockPostRepository.findById.mockResolvedValue(mockPost);
			mockPostReadRepository.findByPostAndUser.mockResolvedValue(null); // Não existe
			mockPostReadRepository.create.mockResolvedValue(mockNewRead);

			const result = await postReadService.markAsRead(postId, userId);

			expect(mockPostRepository.findById).toHaveBeenCalledWith(postId);
			expect(mockPostReadRepository.findByPostAndUser).toHaveBeenCalledWith(postId, userId);
			expect(mockPostReadRepository.create).toHaveBeenCalledWith(
				expect.objectContaining({
					post_id: postId,
					user_id: userId
				})
			);
			expect(result).toEqual({
				id: mockNewRead.id,
				post_id: mockNewRead.post_id,
				user_id: mockNewRead.user_id,
				read_at: mockNewRead.read_at
			});
		});

		test('should return existing record if already marked (idempotent)', async () => {
			const mockPost = { id: postId, title: 'Test Post' };
			const mockExistingRead = {
				id: 'read-uuid-existing',
				post_id: postId,
				user_id: userId,
				read_at: new Date('2024-01-01T09:00:00Z')
			};

			mockPostRepository.findById.mockResolvedValue(mockPost);
			mockPostReadRepository.findByPostAndUser.mockResolvedValue(mockExistingRead);

			const result = await postReadService.markAsRead(postId, userId);

			expect(mockPostRepository.findById).toHaveBeenCalledWith(postId);
			expect(mockPostReadRepository.findByPostAndUser).toHaveBeenCalledWith(postId, userId);
			expect(mockPostReadRepository.create).not.toHaveBeenCalled(); // Não deve criar novo
			expect(result).toEqual({
				id: mockExistingRead.id,
				post_id: mockExistingRead.post_id,
				user_id: mockExistingRead.user_id,
				read_at: mockExistingRead.read_at
			});
		});

		test('should throw error if post not found', async () => {
			mockPostRepository.findById.mockResolvedValue(null);

			await expect(postReadService.markAsRead(postId, userId)).rejects.toThrow(
				'Post não encontrado'
			);

			expect(mockPostRepository.findById).toHaveBeenCalledWith(postId);
			expect(mockPostReadRepository.findByPostAndUser).not.toHaveBeenCalled();
			expect(mockPostReadRepository.create).not.toHaveBeenCalled();
		});

		test('should set read_at automatically', async () => {
			const mockPost = { id: postId, title: 'Test Post' };
			const mockNewRead = {
				id: 'read-uuid-789',
				post_id: postId,
				user_id: userId,
				read_at: new Date()
			};

			mockPostRepository.findById.mockResolvedValue(mockPost);
			mockPostReadRepository.findByPostAndUser.mockResolvedValue(null);
			mockPostReadRepository.create.mockResolvedValue(mockNewRead);

			await postReadService.markAsRead(postId, userId);

			expect(mockPostReadRepository.create).toHaveBeenCalledWith(
				expect.objectContaining({
					post_id: postId,
					user_id: userId,
					read_at: expect.any(Date)
				})
			);
		});
	});

	describe('checkIfRead()', () => {
		const postId = 'post-uuid-123';
		const userId = 'user-uuid-456';

		test('should return { read: true, read_at } if already read', async () => {
			const mockRead = {
				id: 'read-uuid-789',
				post_id: postId,
				user_id: userId,
				read_at: new Date('2024-01-01T10:00:00Z')
			};

			mockPostReadRepository.findByPostAndUser.mockResolvedValue(mockRead);

			const result = await postReadService.checkIfRead(postId, userId);

			expect(mockPostReadRepository.findByPostAndUser).toHaveBeenCalledWith(postId, userId);
			expect(result).toEqual({
				read: true,
				read_at: mockRead.read_at
			});
		});

		test('should return { read: false, read_at: null } if not read', async () => {
			mockPostReadRepository.findByPostAndUser.mockResolvedValue(null);

			const result = await postReadService.checkIfRead(postId, userId);

			expect(mockPostReadRepository.findByPostAndUser).toHaveBeenCalledWith(postId, userId);
			expect(result).toEqual({
				read: false,
				read_at: null
			});
		});
	});
});
