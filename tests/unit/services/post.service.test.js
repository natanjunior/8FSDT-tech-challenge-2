// Tests for PostService (v11 - Hard Delete + Visibility by Role)
// Run with: npm test tests/unit/services/post.service.test.js

const { Op } = require('sequelize');

// Mock dependencies
jest.mock('../../../src/models', () => ({
	Post: {
		findAndCountAll: jest.fn(),
		findByPk: jest.fn(),
		create: jest.fn(),
		destroy: jest.fn()
	},
	User: {},
	Discipline: {}
}));

const PostService = require('../../../src/services/post.service');
const { Post } = require('../../../src/models');

describe('PostService - CRUD with Role-Based Visibility', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('listPosts()', () => {
		const mockPosts = [
			{ id: '1', title: 'Post 1', status: 'PUBLISHED' },
			{ id: '2', title: 'Post 2', status: 'DRAFT' }
		];

		test('should return all posts for TEACHER (no status filter)', async () => {
			Post.findAndCountAll.mockResolvedValue({
				count: 2,
				rows: mockPosts
			});

			const result = await PostService.listPosts({ page: 1, limit: 20 }, 'TEACHER');

			expect(Post.findAndCountAll).toHaveBeenCalledWith(
				expect.objectContaining({
					where: {}, // No status filter for TEACHER
					order: [['created_at', 'DESC']],
					limit: 20,
					offset: 0
				})
			);
			expect(result.data).toEqual(mockPosts);
			expect(result.pagination).toEqual({
				page: 1,
				limit: 20,
				total: 2,
				totalPages: 1
			});
		});

		test('should return only PUBLISHED posts for STUDENT', async () => {
			const publishedPosts = [mockPosts[0]];
			Post.findAndCountAll.mockResolvedValue({
				count: 1,
				rows: publishedPosts
			});

			const result = await PostService.listPosts({ page: 1, limit: 20 }, 'STUDENT');

			expect(Post.findAndCountAll).toHaveBeenCalledWith(
				expect.objectContaining({
					where: { status: 'PUBLISHED' }
				})
			);
			expect(result.data).toEqual(publishedPosts);
		});

		test('should return only PUBLISHED posts for unauthenticated (null)', async () => {
			const publishedPosts = [mockPosts[0]];
			Post.findAndCountAll.mockResolvedValue({
				count: 1,
				rows: publishedPosts
			});

			const result = await PostService.listPosts({ page: 1, limit: 20 }, null);

			expect(Post.findAndCountAll).toHaveBeenCalledWith(
				expect.objectContaining({
					where: { status: 'PUBLISHED' }
				})
			);
			expect(result.data).toEqual(publishedPosts);
		});

		test('should return correct pagination', async () => {
			Post.findAndCountAll.mockResolvedValue({
				count: 45,
				rows: mockPosts
			});

			const result = await PostService.listPosts({ page: 2, limit: 20 }, 'TEACHER');

			expect(Post.findAndCountAll).toHaveBeenCalledWith(
				expect.objectContaining({
					limit: 20,
					offset: 20 // (page 2 - 1) * 20
				})
			);
			expect(result.pagination).toEqual({
				page: 2,
				limit: 20,
				total: 45,
				totalPages: 3
			});
		});

		test('should use default page 1 and limit 20 when not provided', async () => {
			Post.findAndCountAll.mockResolvedValue({
				count: 10,
				rows: mockPosts
			});

			await PostService.listPosts({}, 'TEACHER');

			expect(Post.findAndCountAll).toHaveBeenCalledWith(
				expect.objectContaining({
					limit: 20,
					offset: 0
				})
			);
		});
	});

	describe('getPostById()', () => {
		test('should return post with includes', async () => {
			const mockPost = {
				id: '1',
				title: 'Test Post',
				status: 'PUBLISHED',
				author: { id: '1', name: 'Teacher' },
				discipline: { id: '1', label: 'Math' }
			};

			Post.findByPk.mockResolvedValue(mockPost);

			const result = await PostService.getPostById('1');

			expect(Post.findByPk).toHaveBeenCalledWith(
				'1',
				expect.objectContaining({
					include: expect.arrayContaining([
						expect.objectContaining({ as: 'author' }),
						expect.objectContaining({ as: 'discipline' })
					])
				})
			);
			expect(result).toEqual(mockPost);
		});

		test('should throw error when post not found', async () => {
			Post.findByPk.mockResolvedValue(null);

			await expect(PostService.getPostById('invalid-id')).rejects.toThrow(
				'Post não encontrado'
			);
		});
	});

	describe('createPost()', () => {
		test('should create post successfully', async () => {
			const mockData = {
				title: 'New Post',
				content: 'This is a test post content',
				discipline_id: '1',
				status: 'DRAFT'
			};
			const mockCreatedPost = { id: '1', ...mockData };
			const mockPostWithIncludes = { ...mockCreatedPost, author: {}, discipline: {} };

			Post.create.mockResolvedValue(mockCreatedPost);
			Post.findByPk.mockResolvedValue(mockPostWithIncludes);

			const result = await PostService.createPost(mockData, 'user-123');

			expect(Post.create).toHaveBeenCalledWith(
				expect.objectContaining({
					title: mockData.title,
					content: mockData.content,
					author_id: 'user-123',
					discipline_id: mockData.discipline_id,
					status: 'DRAFT',
					published_at: null // DRAFT doesn't set published_at
				})
			);
			expect(result).toEqual(mockPostWithIncludes);
		});

		test('should set published_at when status is PUBLISHED', async () => {
			const mockData = {
				title: 'Published Post',
				content: 'This is a published post',
				status: 'PUBLISHED'
			};

			Post.create.mockResolvedValue({ id: '1', ...mockData });
			Post.findByPk.mockResolvedValue({ id: '1' });

			await PostService.createPost(mockData, 'user-123');

			expect(Post.create).toHaveBeenCalledWith(
				expect.objectContaining({
					published_at: expect.any(Date)
				})
			);
		});

		test('should throw error when title is too short', async () => {
			const mockData = {
				title: 'Test', // Less than 5 characters
				content: 'Valid content here'
			};

			await expect(PostService.createPost(mockData, 'user-123')).rejects.toThrow(
				'Título deve ter no mínimo 5 caracteres'
			);
		});

		test('should throw error when content is too short', async () => {
			const mockData = {
				title: 'Valid Title',
				content: 'Short' // Less than 10 characters
			};

			await expect(PostService.createPost(mockData, 'user-123')).rejects.toThrow(
				'Conteúdo deve ter no mínimo 10 caracteres'
			);
		});
	});

	describe('updatePost()', () => {
		test('should update post successfully (no ownership check)', async () => {
			const mockPost = {
				id: '1',
				title: 'Old Title',
				published_at: null,
				update: jest.fn().mockResolvedValue()
			};
			const mockUpdatedData = { title: 'New Title' };

			Post.findByPk.mockResolvedValueOnce(mockPost); // For update
			Post.findByPk.mockResolvedValueOnce({ ...mockPost, title: 'New Title' }); // For getPostById

			await PostService.updatePost('1', mockUpdatedData);

			expect(mockPost.update).toHaveBeenCalledWith(mockUpdatedData);
		});

		test('should set published_at when changing status to PUBLISHED', async () => {
			const mockPost = {
				id: '1',
				published_at: null,
				update: jest.fn().mockResolvedValue()
			};

			Post.findByPk.mockResolvedValueOnce(mockPost);
			Post.findByPk.mockResolvedValueOnce(mockPost);

			await PostService.updatePost('1', { status: 'PUBLISHED' });

			expect(mockPost.update).toHaveBeenCalledWith(
				expect.objectContaining({
					status: 'PUBLISHED',
					published_at: expect.any(Date)
				})
			);
		});

		test('should throw error when post not found', async () => {
			Post.findByPk.mockResolvedValue(null);

			await expect(PostService.updatePost('invalid-id', {})).rejects.toThrow(
				'Post não encontrado'
			);
		});
	});

	describe('deletePost()', () => {
		test('should delete post permanently (hard delete)', async () => {
			const mockPost = { id: '1', title: 'Post to Delete' };

			Post.findByPk.mockResolvedValue(mockPost);
			Post.destroy.mockResolvedValue(1);

			await PostService.deletePost('1');

			expect(Post.destroy).toHaveBeenCalledWith({ where: { id: '1' } });
		});

		test('should throw error when post not found', async () => {
			Post.findByPk.mockResolvedValue(null);

			await expect(PostService.deletePost('invalid-id')).rejects.toThrow(
				'Post não encontrado'
			);

			expect(Post.destroy).not.toHaveBeenCalled();
		});
	});

	describe('searchPosts()', () => {
		test('should call listPosts when no search parameters provided', async () => {
			const mockResult = {
				data: [],
				pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
			};

			Post.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

			const result = await PostService.searchPosts({}, 'TEACHER');

			// When no search params, it calls listPosts which calls findAndCountAll
			expect(Post.findAndCountAll).toHaveBeenCalled();
			expect(result).toEqual(mockResult);
		});

		test('should filter by query (title OR content)', async () => {
			Post.findAndCountAll.mockResolvedValue({ count: 1, rows: [] });

			await PostService.searchPosts({ query: 'test' }, 'TEACHER');

			expect(Post.findAndCountAll).toHaveBeenCalledWith(
				expect.objectContaining({
					where: expect.objectContaining({
						[Op.or]: [
							{ title: { [Op.iLike]: '%test%' } },
							{ content: { [Op.iLike]: '%test%' } }
						]
					})
				})
			);
		});

		test('should filter by title only', async () => {
			Post.findAndCountAll.mockResolvedValue({ count: 1, rows: [] });

			await PostService.searchPosts({ title: 'intro' }, 'TEACHER');

			expect(Post.findAndCountAll).toHaveBeenCalledWith(
				expect.objectContaining({
					where: expect.objectContaining({
						title: { [Op.iLike]: '%intro%' }
					})
				})
			);
		});

		test('should filter by author name', async () => {
			Post.findAndCountAll.mockResolvedValue({ count: 1, rows: [] });

			await PostService.searchPosts({ author: 'silva' }, 'TEACHER');

			expect(Post.findAndCountAll).toHaveBeenCalledWith(
				expect.objectContaining({
					include: expect.arrayContaining([
						expect.objectContaining({
							as: 'author',
							where: {
								name: { [Op.iLike]: '%silva%' }
							}
						})
					])
				})
			);
		});

		test('should apply PUBLISHED filter for non-TEACHER users', async () => {
			Post.findAndCountAll.mockResolvedValue({ count: 1, rows: [] });

			await PostService.searchPosts({ query: 'test' }, 'STUDENT');

			expect(Post.findAndCountAll).toHaveBeenCalledWith(
				expect.objectContaining({
					where: expect.objectContaining({
						status: 'PUBLISHED'
					})
				})
			);
		});
	});
});
