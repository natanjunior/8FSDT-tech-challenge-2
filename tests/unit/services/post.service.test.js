// Tests for PostService (v11 - Hard Delete + Visibility by Role)
// Run with: npm test tests/unit/services/post.service.test.js

const { Op } = require('sequelize');

// Mock dependencies
jest.mock('../../../src/repositories/post.repository');

const PostService = require('../../../src/services/post.service');
const PostRepository = require('../../../src/repositories/post.repository');

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
			PostRepository.findAllPaginated.mockResolvedValue({
				count: 2,
				rows: mockPosts
			});

			const result = await PostService.listPosts({ page: 1, limit: 20 }, 'TEACHER');

			expect(PostRepository.findAllPaginated).toHaveBeenCalledWith(
				{}, // No status filter for TEACHER
				{ limit: 20, offset: 0 }
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
			PostRepository.findAllPaginated.mockResolvedValue({
				count: 1,
				rows: publishedPosts
			});

			const result = await PostService.listPosts({ page: 1, limit: 20 }, 'STUDENT');

			expect(PostRepository.findAllPaginated).toHaveBeenCalledWith(
				{ status: 'PUBLISHED' },
				{ limit: 20, offset: 0 }
			);
			expect(result.data).toEqual(publishedPosts);
		});

		test('should return only PUBLISHED posts for unauthenticated (null)', async () => {
			const publishedPosts = [mockPosts[0]];
			PostRepository.findAllPaginated.mockResolvedValue({
				count: 1,
				rows: publishedPosts
			});

			const result = await PostService.listPosts({ page: 1, limit: 20 }, null);

			expect(PostRepository.findAllPaginated).toHaveBeenCalledWith(
				{ status: 'PUBLISHED' },
				{ limit: 20, offset: 0 }
			);
			expect(result.data).toEqual(publishedPosts);
		});

		test('should return correct pagination', async () => {
			PostRepository.findAllPaginated.mockResolvedValue({
				count: 45,
				rows: mockPosts
			});

			const result = await PostService.listPosts({ page: 2, limit: 20 }, 'TEACHER');

			expect(PostRepository.findAllPaginated).toHaveBeenCalledWith(
				{},
				{ limit: 20, offset: 20 } // (page 2 - 1) * 20
			);
			expect(result.pagination).toEqual({
				page: 2,
				limit: 20,
				total: 45,
				totalPages: 3
			});
		});

		test('should use default page 1 and limit 20 when not provided', async () => {
			PostRepository.findAllPaginated.mockResolvedValue({
				count: 10,
				rows: mockPosts
			});

			await PostService.listPosts({}, 'TEACHER');

			expect(PostRepository.findAllPaginated).toHaveBeenCalledWith(
				{},
				{ limit: 20, offset: 0 }
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

			PostRepository.findById.mockResolvedValue(mockPost);

			const result = await PostService.getPostById('1');

			expect(PostRepository.findById).toHaveBeenCalledWith('1');
			expect(result).toEqual(mockPost);
		});

		test('should throw error when post not found', async () => {
			PostRepository.findById.mockResolvedValue(null);

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

			PostRepository.create.mockResolvedValue(mockCreatedPost);
			PostRepository.findById.mockResolvedValue(mockPostWithIncludes);

			const result = await PostService.createPost(mockData, 'user-123');

			expect(PostRepository.create).toHaveBeenCalledWith(
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

			PostRepository.create.mockResolvedValue({ id: '1', ...mockData });
			PostRepository.findById.mockResolvedValue({ id: '1' });

			await PostService.createPost(mockData, 'user-123');

			expect(PostRepository.create).toHaveBeenCalledWith(
				expect.objectContaining({
					published_at: expect.any(Date)
				})
			);
		});
	});

	describe('updatePost()', () => {
		test('should update post successfully (no ownership check)', async () => {
			const mockPost = {
				id: '1',
				title: 'Old Title',
				published_at: null
			};
			const mockUpdatedData = { title: 'New Title' };

			PostRepository.findById.mockResolvedValueOnce(mockPost); // For existence check
			PostRepository.update.mockResolvedValue(mockPost);
			PostRepository.findById.mockResolvedValueOnce({ ...mockPost, title: 'New Title' }); // For getPostById

			await PostService.updatePost('1', mockUpdatedData);

			expect(PostRepository.update).toHaveBeenCalledWith('1', mockUpdatedData);
		});

		test('should set published_at when changing status to PUBLISHED', async () => {
			const mockPost = {
				id: '1',
				published_at: null
			};

			PostRepository.findById.mockResolvedValueOnce(mockPost); // For existence check
			PostRepository.update.mockResolvedValue(mockPost);
			PostRepository.findById.mockResolvedValueOnce(mockPost); // For getPostById

			await PostService.updatePost('1', { status: 'PUBLISHED' });

			expect(PostRepository.update).toHaveBeenCalledWith(
				'1',
				expect.objectContaining({
					status: 'PUBLISHED',
					published_at: expect.any(Date)
				})
			);
		});

		test('should throw error when post not found', async () => {
			PostRepository.findById.mockResolvedValue(null);

			await expect(PostService.updatePost('invalid-id', {})).rejects.toThrow(
				'Post não encontrado'
			);
		});
	});

	describe('deletePost()', () => {
		test('should delete post permanently (hard delete)', async () => {
			const mockPost = { id: '1', title: 'Post to Delete' };

			PostRepository.findById.mockResolvedValue(mockPost);
			PostRepository.delete.mockResolvedValue(1);

			await PostService.deletePost('1');

			expect(PostRepository.delete).toHaveBeenCalledWith('1');
		});

		test('should throw error when post not found', async () => {
			PostRepository.findById.mockResolvedValue(null);

			await expect(PostService.deletePost('invalid-id')).rejects.toThrow(
				'Post não encontrado'
			);

			expect(PostRepository.delete).not.toHaveBeenCalled();
		});
	});

	describe('searchPosts()', () => {
		test('should call listPosts when no search parameters provided', async () => {
			const mockResult = {
				data: [],
				pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
			};

			PostRepository.findAllPaginated.mockResolvedValue({ count: 0, rows: [] });

			const result = await PostService.searchPosts({}, 'TEACHER');

			// When no search params, it calls listPosts which calls findAllPaginated
			expect(PostRepository.findAllPaginated).toHaveBeenCalled();
			expect(result).toEqual(mockResult);
		});

		test('should filter by query (title OR content)', async () => {
			PostRepository.search.mockResolvedValue({ count: 1, rows: [] });

			await PostService.searchPosts({ query: 'test' }, 'TEACHER');

			expect(PostRepository.search).toHaveBeenCalledWith(
				expect.objectContaining({
					[Op.or]: [
						{ title: { [Op.iLike]: '%test%' } },
						{ content: { [Op.iLike]: '%test%' } }
					]
				}),
				null, // no author filter
				{ limit: 20, offset: 0 }
			);
		});

		test('should filter by title only', async () => {
			PostRepository.search.mockResolvedValue({ count: 1, rows: [] });

			await PostService.searchPosts({ title: 'intro' }, 'TEACHER');

			expect(PostRepository.search).toHaveBeenCalledWith(
				expect.objectContaining({
					title: { [Op.iLike]: '%intro%' }
				}),
				null,
				{ limit: 20, offset: 0 }
			);
		});

		test('should filter by author name', async () => {
			PostRepository.search.mockResolvedValue({ count: 1, rows: [] });

			await PostService.searchPosts({ author: 'silva' }, 'TEACHER');

			expect(PostRepository.search).toHaveBeenCalledWith(
				expect.any(Object),
				{ name: { [Op.iLike]: '%silva%' } }, // author filter
				{ limit: 20, offset: 0 }
			);
		});

		test('should apply PUBLISHED filter for non-TEACHER users', async () => {
			PostRepository.search.mockResolvedValue({ count: 1, rows: [] });

			await PostService.searchPosts({ query: 'test' }, 'STUDENT');

			expect(PostRepository.search).toHaveBeenCalledWith(
				expect.objectContaining({
					status: 'PUBLISHED'
				}),
				null,
				{ limit: 20, offset: 0 }
			);
		});
	});
});
