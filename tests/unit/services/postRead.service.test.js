// Tests for PostReadService (Fase 4 - Post Reads with FHIR reader ref)
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
			findByPostAndReader: jest.fn(),
			create: jest.fn(),
			findPaginated: jest.fn()
		};

		// Instanciar service com dependências injetadas
		postReadService = new PostReadService(mockPostRepository, mockPostReadRepository);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('markAsRead()', () => {
		const postId = 'post-uuid-123';
		const reader = 'Student/abc-456';

		test('should create new read record if not exists', async () => {
			const mockPost = { id: postId, title: 'Test Post' };
			const mockNewRead = {
				id: 'read-uuid-789',
				post_id: postId,
				reader,
				read_at: new Date('2024-01-01T10:00:00Z')
			};

			mockPostRepository.findById.mockResolvedValue(mockPost);
			mockPostReadRepository.findByPostAndReader.mockResolvedValue(null); // Não existe
			mockPostReadRepository.create.mockResolvedValue(mockNewRead);

			const result = await postReadService.markAsRead(postId, reader);

			expect(mockPostRepository.findById).toHaveBeenCalledWith(postId);
			expect(mockPostReadRepository.findByPostAndReader).toHaveBeenCalledWith(postId, reader);
			expect(mockPostReadRepository.create).toHaveBeenCalledWith(
				expect.objectContaining({
					post_id: postId,
					reader
				})
			);
			expect(result).toEqual({
				created: true,
				id: mockNewRead.id,
				post_id: mockNewRead.post_id,
				reader: mockNewRead.reader,
				read_at: mockNewRead.read_at
			});
		});

		test('should return existing record if already marked (idempotent)', async () => {
			const mockPost = { id: postId, title: 'Test Post' };
			const mockExistingRead = {
				id: 'read-uuid-existing',
				post_id: postId,
				reader,
				read_at: new Date('2024-01-01T09:00:00Z')
			};

			mockPostRepository.findById.mockResolvedValue(mockPost);
			mockPostReadRepository.findByPostAndReader.mockResolvedValue(mockExistingRead);

			const result = await postReadService.markAsRead(postId, reader);

			expect(mockPostRepository.findById).toHaveBeenCalledWith(postId);
			expect(mockPostReadRepository.findByPostAndReader).toHaveBeenCalledWith(postId, reader);
			expect(mockPostReadRepository.create).not.toHaveBeenCalled(); // Não deve criar novo
			expect(result).toEqual({
				created: false,
				id: mockExistingRead.id,
				post_id: mockExistingRead.post_id,
				reader: mockExistingRead.reader,
				read_at: mockExistingRead.read_at
			});
		});

		test('should throw error if post not found', async () => {
			mockPostRepository.findById.mockResolvedValue(null);

			await expect(postReadService.markAsRead(postId, reader)).rejects.toThrow(
				'Post não encontrado'
			);

			expect(mockPostRepository.findById).toHaveBeenCalledWith(postId);
			expect(mockPostReadRepository.findByPostAndReader).not.toHaveBeenCalled();
			expect(mockPostReadRepository.create).not.toHaveBeenCalled();
		});

		test('should set read_at automatically', async () => {
			const mockPost = { id: postId, title: 'Test Post' };
			const mockNewRead = {
				id: 'read-uuid-789',
				post_id: postId,
				reader,
				read_at: new Date()
			};

			mockPostRepository.findById.mockResolvedValue(mockPost);
			mockPostReadRepository.findByPostAndReader.mockResolvedValue(null);
			mockPostReadRepository.create.mockResolvedValue(mockNewRead);

			await postReadService.markAsRead(postId, reader);

			expect(mockPostReadRepository.create).toHaveBeenCalledWith(
				expect.objectContaining({
					post_id: postId,
					reader,
					read_at: expect.any(Date)
				})
			);
		});
	});

	describe('searchReads()', () => {
		const reader = 'Student/abc-456';

		test('should return data and pagination', async () => {
			const rows = [
				{ id: 'r1', post_id: 'p1', reader, read_at: new Date('2024-01-01T10:00:00Z') }
			];
			mockPostReadRepository.findPaginated.mockResolvedValue({ count: 1, rows });

			const result = await postReadService.searchReads(reader, { page: 1, limit: 20 });

			expect(mockPostReadRepository.findPaginated).toHaveBeenCalledWith(
				reader,
				expect.objectContaining({ page: 1, limit: 20 })
			);
			expect(result.data).toEqual([
				{ id: 'r1', post_id: 'p1', reader, read_at: rows[0].read_at }
			]);
			expect(result.pagination).toEqual({ page: 1, limit: 20, total: 1, totalPages: 1 });
		});

		test('should pass postId filter to repository', async () => {
			mockPostReadRepository.findPaginated.mockResolvedValue({ count: 0, rows: [] });

			await postReadService.searchReads(reader, { postId: 'post-1' });

			expect(mockPostReadRepository.findPaginated).toHaveBeenCalledWith(
				reader,
				expect.objectContaining({ postId: 'post-1' })
			);
		});
	});
});
