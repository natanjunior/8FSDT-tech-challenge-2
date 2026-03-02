// Tests for PostReadService (FASE 5 - Post Reads)
// Run with: npm test tests/unit/services/postRead.service.test.js

// Mock dependencies
jest.mock('../../../src/repositories/post.repository');
jest.mock('../../../src/repositories/postRead.repository');

const PostReadService = require('../../../src/services/postRead.service');
const PostRepository = require('../../../src/repositories/post.repository');
const PostReadRepository = require('../../../src/repositories/postRead.repository');

describe('PostReadService - Post Reads', () => {
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

			PostRepository.findById.mockResolvedValue(mockPost);
			PostReadRepository.findByPostAndUser.mockResolvedValue(null); // Não existe
			PostReadRepository.create.mockResolvedValue(mockNewRead);

			const result = await PostReadService.markAsRead(postId, userId);

			expect(PostRepository.findById).toHaveBeenCalledWith(postId);
			expect(PostReadRepository.findByPostAndUser).toHaveBeenCalledWith(postId, userId);
			expect(PostReadRepository.create).toHaveBeenCalledWith(
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

			PostRepository.findById.mockResolvedValue(mockPost);
			PostReadRepository.findByPostAndUser.mockResolvedValue(mockExistingRead);

			const result = await PostReadService.markAsRead(postId, userId);

			expect(PostRepository.findById).toHaveBeenCalledWith(postId);
			expect(PostReadRepository.findByPostAndUser).toHaveBeenCalledWith(postId, userId);
			expect(PostReadRepository.create).not.toHaveBeenCalled(); // Não deve criar novo
			expect(result).toEqual({
				id: mockExistingRead.id,
				post_id: mockExistingRead.post_id,
				user_id: mockExistingRead.user_id,
				read_at: mockExistingRead.read_at
			});
		});

		test('should throw error if post not found', async () => {
			PostRepository.findById.mockResolvedValue(null);

			await expect(PostReadService.markAsRead(postId, userId)).rejects.toThrow(
				'Post não encontrado'
			);

			expect(PostRepository.findById).toHaveBeenCalledWith(postId);
			expect(PostReadRepository.findByPostAndUser).not.toHaveBeenCalled();
			expect(PostReadRepository.create).not.toHaveBeenCalled();
		});

		test('should set read_at automatically', async () => {
			const mockPost = { id: postId, title: 'Test Post' };
			const mockNewRead = {
				id: 'read-uuid-789',
				post_id: postId,
				user_id: userId,
				read_at: new Date()
			};

			PostRepository.findById.mockResolvedValue(mockPost);
			PostReadRepository.findByPostAndUser.mockResolvedValue(null);
			PostReadRepository.create.mockResolvedValue(mockNewRead);

			await PostReadService.markAsRead(postId, userId);

			expect(PostReadRepository.create).toHaveBeenCalledWith(
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

			PostReadRepository.findByPostAndUser.mockResolvedValue(mockRead);

			const result = await PostReadService.checkIfRead(postId, userId);

			expect(PostReadRepository.findByPostAndUser).toHaveBeenCalledWith(postId, userId);
			expect(result).toEqual({
				read: true,
				read_at: mockRead.read_at
			});
		});

		test('should return { read: false, read_at: null } if not read', async () => {
			PostReadRepository.findByPostAndUser.mockResolvedValue(null);

			const result = await PostReadService.checkIfRead(postId, userId);

			expect(PostReadRepository.findByPostAndUser).toHaveBeenCalledWith(postId, userId);
			expect(result).toEqual({
				read: false,
				read_at: null
			});
		});
	});
});
