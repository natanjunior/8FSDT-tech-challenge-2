// Tests for PostService (v11 - Hard Delete + Visibility by Role)
// Run with: npm test tests/unit/services/post.service.test.js

const { Op } = require('sequelize');

const PostService = require('../../../src/services/post.service');

describe('PostService - CRUD with Role-Based Visibility', () => {
	let postService;
	let mockPostRepository;

	beforeEach(() => {
		// Criar mock do repositório (injetado no constructor)
		mockPostRepository = {
			findAllPaginated: jest.fn(),
			findById: jest.fn(),
			create: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
			search: jest.fn()
		};

		// Instanciar service com dependência injetada
		postService = new PostService(mockPostRepository);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('listPosts()', () => {
		const mockPosts = [
			{ id: '1', title: 'Post 1', status: 'PUBLISHED', author_id: 'u1', discipline_id: 'd1', author: { id: 'u1', name: 'Teacher', role: 'TEACHER' }, discipline: { id: 'd1', label: 'Math' } },
			{ id: '2', title: 'Post 2', status: 'DRAFT', author_id: 'u1', discipline_id: 'd1', author: { id: 'u1', name: 'Teacher', role: 'TEACHER' }, discipline: { id: 'd1', label: 'Math' } }
		];

		const serializedPosts = [
			{ id: '1', title: 'Post 1', status: 'PUBLISHED', author: { id: 'u1', name: 'Teacher', role: 'TEACHER' }, discipline: { id: 'd1', label: 'Math' } },
			{ id: '2', title: 'Post 2', status: 'DRAFT', author: { id: 'u1', name: 'Teacher', role: 'TEACHER' }, discipline: { id: 'd1', label: 'Math' } }
		];

		test('should return all posts for TEACHER (no status filter)', async () => {
			mockPostRepository.findAllPaginated.mockResolvedValue({
				count: 2,
				rows: mockPosts
			});

			const result = await postService.listPosts({ page: 1, limit: 20 }, 'TEACHER');

			expect(mockPostRepository.findAllPaginated).toHaveBeenCalledWith(
				{}, // No status filter for TEACHER
				{ limit: 20, offset: 0 }
			);
			expect(result.data).toEqual(serializedPosts);
			// Verify FK fields are stripped
			result.data.forEach((post) => {
				expect(post).not.toHaveProperty('author_id');
				expect(post).not.toHaveProperty('discipline_id');
			});
			expect(result.pagination).toEqual({
				page: 1,
				limit: 20,
				total: 2,
				totalPages: 1
			});
		});

		test('should return only PUBLISHED posts for STUDENT', async () => {
			const publishedPosts = [mockPosts[0]];
			mockPostRepository.findAllPaginated.mockResolvedValue({
				count: 1,
				rows: publishedPosts
			});

			const result = await postService.listPosts({ page: 1, limit: 20 }, 'STUDENT');

			expect(mockPostRepository.findAllPaginated).toHaveBeenCalledWith(
				{ status: 'PUBLISHED' },
				{ limit: 20, offset: 0 }
			);
			expect(result.data).toEqual([serializedPosts[0]]);
		});

		test('should return only PUBLISHED posts for unauthenticated (null)', async () => {
			const publishedPosts = [mockPosts[0]];
			mockPostRepository.findAllPaginated.mockResolvedValue({
				count: 1,
				rows: publishedPosts
			});

			const result = await postService.listPosts({ page: 1, limit: 20 }, null);

			expect(mockPostRepository.findAllPaginated).toHaveBeenCalledWith(
				{ status: 'PUBLISHED' },
				{ limit: 20, offset: 0 }
			);
			expect(result.data).toEqual([serializedPosts[0]]);
		});

		test('should return correct pagination', async () => {
			mockPostRepository.findAllPaginated.mockResolvedValue({
				count: 45,
				rows: mockPosts
			});

			const result = await postService.listPosts({ page: 2, limit: 20 }, 'TEACHER');

			expect(mockPostRepository.findAllPaginated).toHaveBeenCalledWith(
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
			mockPostRepository.findAllPaginated.mockResolvedValue({
				count: 10,
				rows: mockPosts
			});

			await postService.listPosts({}, 'TEACHER');

			expect(mockPostRepository.findAllPaginated).toHaveBeenCalledWith(
				{},
				{ limit: 20, offset: 0 }
			);
		});
	});

	describe('getPostById()', () => {
		test('should return post with includes and without FK fields', async () => {
			const mockPost = {
				id: '1',
				title: 'Test Post',
				status: 'PUBLISHED',
				author_id: 'u1',
				discipline_id: 'd1',
				author: { id: 'u1', name: 'Teacher', role: 'TEACHER' },
				discipline: { id: 'd1', label: 'Math' }
			};

			mockPostRepository.findById.mockResolvedValue(mockPost);

			const result = await postService.getPostById('1');

			expect(mockPostRepository.findById).toHaveBeenCalledWith('1');
			expect(result).not.toHaveProperty('author_id');
			expect(result).not.toHaveProperty('discipline_id');
			expect(result.author).toEqual({ id: 'u1', name: 'Teacher', role: 'TEACHER' });
			expect(result.discipline).toEqual({ id: 'd1', label: 'Math' });
		});

		test('should throw error when post not found', async () => {
			mockPostRepository.findById.mockResolvedValue(null);

			await expect(postService.getPostById('invalid-id')).rejects.toThrow(
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
			const mockCreatedPost = { id: '1', ...mockData, author_id: 'user-123' };
			const mockPostWithIncludes = {
				...mockCreatedPost,
				author: { id: 'user-123', name: 'Teacher', role: 'TEACHER' },
				discipline: { id: '1', label: 'Math' }
			};

			mockPostRepository.create.mockResolvedValue(mockCreatedPost);
			mockPostRepository.findById.mockResolvedValue(mockPostWithIncludes);

			const result = await postService.createPost(mockData, 'user-123');

			expect(mockPostRepository.create).toHaveBeenCalledWith(
				expect.objectContaining({
					title: mockData.title,
					content: mockData.content,
					author_id: 'user-123',
					discipline_id: mockData.discipline_id,
					status: 'DRAFT',
					published_at: null // DRAFT doesn't set published_at
				})
			);
			// Result should be serialized (no FK fields)
			expect(result).not.toHaveProperty('author_id');
			expect(result).not.toHaveProperty('discipline_id');
			expect(result.author).toEqual({ id: 'user-123', name: 'Teacher', role: 'TEACHER' });
		});

		test('should set published_at when status is PUBLISHED', async () => {
			const mockData = {
				title: 'Published Post',
				content: 'This is a published post',
				status: 'PUBLISHED'
			};

			mockPostRepository.create.mockResolvedValue({ id: '1', ...mockData });
			mockPostRepository.findById.mockResolvedValue({ id: '1' });

			await postService.createPost(mockData, 'user-123');

			expect(mockPostRepository.create).toHaveBeenCalledWith(
				expect.objectContaining({
					published_at: expect.any(Date)
				})
			);
		});
	});

	describe('replacePost()', () => {
		test('should replace post with all fields', async () => {
			const mockPost = {
				id: '1',
				title: 'Old Title',
				content: 'Old Content',
				status: 'DRAFT',
				discipline_id: 'disc-1',
				published_at: null
			};

			mockPostRepository.findById.mockResolvedValueOnce(mockPost);
			mockPostRepository.update.mockResolvedValue(mockPost);
			mockPostRepository.findById.mockResolvedValueOnce({ ...mockPost, title: 'New Title' });

			await postService.replacePost('1', {
				title: 'New Title',
				content: 'New Content',
				status: 'DRAFT'
			});

			expect(mockPostRepository.update).toHaveBeenCalledWith('1', {
				title: 'New Title',
				content: 'New Content',
				status: 'DRAFT',
				discipline_id: null
			});
		});

		test('should set discipline_id to null when not provided', async () => {
			const mockPost = {
				id: '1',
				title: 'Old Title',
				discipline_id: 'disc-1',
				published_at: null
			};

			mockPostRepository.findById.mockResolvedValueOnce(mockPost);
			mockPostRepository.update.mockResolvedValue(mockPost);
			mockPostRepository.findById.mockResolvedValueOnce(mockPost);

			await postService.replacePost('1', {
				title: 'New Title',
				content: 'New Content',
				status: 'DRAFT'
			});

			expect(mockPostRepository.update).toHaveBeenCalledWith(
				'1',
				expect.objectContaining({ discipline_id: null })
			);
		});

		test('should set published_at when changing status to PUBLISHED', async () => {
			const mockPost = {
				id: '1',
				published_at: null
			};

			mockPostRepository.findById.mockResolvedValueOnce(mockPost);
			mockPostRepository.update.mockResolvedValue(mockPost);
			mockPostRepository.findById.mockResolvedValueOnce(mockPost);

			await postService.replacePost('1', {
				title: 'Title',
				content: 'Content for test',
				status: 'PUBLISHED'
			});

			expect(mockPostRepository.update).toHaveBeenCalledWith(
				'1',
				expect.objectContaining({
					status: 'PUBLISHED',
					published_at: expect.any(Date)
				})
			);
		});

		test('should throw error when post not found', async () => {
			mockPostRepository.findById.mockResolvedValue(null);

			await expect(
				postService.replacePost('invalid-id', {
					title: 'Title',
					content: 'Content for test',
					status: 'DRAFT'
				})
			).rejects.toThrow('Post não encontrado');
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

			mockPostRepository.findById.mockResolvedValueOnce(mockPost); // For existence check
			mockPostRepository.update.mockResolvedValue(mockPost);
			mockPostRepository.findById.mockResolvedValueOnce({ ...mockPost, title: 'New Title' }); // For getPostById

			await postService.updatePost('1', mockUpdatedData);

			expect(mockPostRepository.update).toHaveBeenCalledWith('1', mockUpdatedData);
		});

		test('should set published_at when changing status to PUBLISHED', async () => {
			const mockPost = {
				id: '1',
				published_at: null
			};

			mockPostRepository.findById.mockResolvedValueOnce(mockPost); // For existence check
			mockPostRepository.update.mockResolvedValue(mockPost);
			mockPostRepository.findById.mockResolvedValueOnce(mockPost); // For getPostById

			await postService.updatePost('1', { status: 'PUBLISHED' });

			expect(mockPostRepository.update).toHaveBeenCalledWith(
				'1',
				expect.objectContaining({
					status: 'PUBLISHED',
					published_at: expect.any(Date)
				})
			);
		});

		test('should throw error when post not found', async () => {
			mockPostRepository.findById.mockResolvedValue(null);

			await expect(postService.updatePost('invalid-id', {})).rejects.toThrow(
				'Post não encontrado'
			);
		});
	});

	describe('deletePost()', () => {
		test('should delete post permanently (hard delete)', async () => {
			const mockPost = { id: '1', title: 'Post to Delete' };

			mockPostRepository.findById.mockResolvedValue(mockPost);
			mockPostRepository.delete.mockResolvedValue(1);

			await postService.deletePost('1');

			expect(mockPostRepository.delete).toHaveBeenCalledWith('1');
		});

		test('should throw error when post not found', async () => {
			mockPostRepository.findById.mockResolvedValue(null);

			await expect(postService.deletePost('invalid-id')).rejects.toThrow(
				'Post não encontrado'
			);

			expect(mockPostRepository.delete).not.toHaveBeenCalled();
		});
	});

	describe('searchPosts()', () => {
		test('should call listPosts when no search parameters provided', async () => {
			mockPostRepository.findAllPaginated.mockResolvedValue({ count: 0, rows: [] });

			const result = await postService.searchPosts({}, 'TEACHER');

			// When no search params, it calls listPosts which calls findAllPaginated
			expect(mockPostRepository.findAllPaginated).toHaveBeenCalled();
			expect(result.data).toEqual([]);
			expect(result.pagination).toEqual({ page: 1, limit: 20, total: 0, totalPages: 0 });
		});

		test('should filter by query (title OR content)', async () => {
			mockPostRepository.search.mockResolvedValue({ count: 1, rows: [] });

			await postService.searchPosts({ query: 'test' }, 'TEACHER');

			expect(mockPostRepository.search).toHaveBeenCalledWith(
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
			mockPostRepository.search.mockResolvedValue({ count: 1, rows: [] });

			await postService.searchPosts({ title: 'intro' }, 'TEACHER');

			expect(mockPostRepository.search).toHaveBeenCalledWith(
				expect.objectContaining({
					title: { [Op.iLike]: '%intro%' }
				}),
				null,
				{ limit: 20, offset: 0 }
			);
		});

		test('should filter by author name', async () => {
			mockPostRepository.search.mockResolvedValue({ count: 1, rows: [] });

			await postService.searchPosts({ author: 'silva' }, 'TEACHER');

			expect(mockPostRepository.search).toHaveBeenCalledWith(
				expect.any(Object),
				{ name: { [Op.iLike]: '%silva%' } }, // author filter
				{ limit: 20, offset: 0 }
			);
		});

		test('should apply PUBLISHED filter for non-TEACHER users', async () => {
			mockPostRepository.search.mockResolvedValue({ count: 1, rows: [] });

			await postService.searchPosts({ query: 'test' }, 'STUDENT');

			expect(mockPostRepository.search).toHaveBeenCalledWith(
				expect.objectContaining({
					status: 'PUBLISHED'
				}),
				null,
				{ limit: 20, offset: 0 }
			);
		});
	});
});
