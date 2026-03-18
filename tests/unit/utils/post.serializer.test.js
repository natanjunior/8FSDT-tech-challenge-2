const { serializePost, serializePosts } = require('../../../src/utils/post.serializer');

describe('Post Serializer', () => {
	const mockPost = {
		id: '1',
		title: 'Test Post',
		content: 'Content here',
		author_id: 'user-1',
		discipline_id: 'disc-1',
		status: 'PUBLISHED',
		published_at: '2024-01-15T10:00:00Z',
		created_at: '2024-01-15T10:00:00Z',
		updated_at: '2024-01-15T10:00:00Z',
		author: { id: 'user-1', name: 'Teacher', role: 'TEACHER' },
		discipline: { id: 'disc-1', label: 'Matemática' }
	};

	describe('serializePost()', () => {
		test('should remove author_id and discipline_id', () => {
			const result = serializePost(mockPost);

			expect(result).not.toHaveProperty('author_id');
			expect(result).not.toHaveProperty('discipline_id');
		});

		test('should keep author and discipline objects', () => {
			const result = serializePost(mockPost);

			expect(result.author).toEqual({ id: 'user-1', name: 'Teacher', role: 'TEACHER' });
			expect(result.discipline).toEqual({ id: 'disc-1', label: 'Matemática' });
		});

		test('should keep all other fields', () => {
			const result = serializePost(mockPost);

			expect(result.id).toBe('1');
			expect(result.title).toBe('Test Post');
			expect(result.content).toBe('Content here');
			expect(result.status).toBe('PUBLISHED');
			expect(result.published_at).toBe('2024-01-15T10:00:00Z');
			expect(result.created_at).toBe('2024-01-15T10:00:00Z');
			expect(result.updated_at).toBe('2024-01-15T10:00:00Z');
		});

		test('should handle Sequelize model instance with toJSON', () => {
			const sequelizePost = {
				...mockPost,
				toJSON: () => ({ ...mockPost })
			};

			const result = serializePost(sequelizePost);

			expect(result).not.toHaveProperty('author_id');
			expect(result).not.toHaveProperty('discipline_id');
			expect(result.author).toEqual({ id: 'user-1', name: 'Teacher', role: 'TEACHER' });
		});

		test('should return null/undefined as-is', () => {
			expect(serializePost(null)).toBeNull();
			expect(serializePost(undefined)).toBeUndefined();
		});
	});

	describe('serializePosts()', () => {
		test('should serialize all posts in array', () => {
			const posts = [mockPost, { ...mockPost, id: '2' }];
			const result = serializePosts(posts);

			expect(result).toHaveLength(2);
			result.forEach((post) => {
				expect(post).not.toHaveProperty('author_id');
				expect(post).not.toHaveProperty('discipline_id');
				expect(post).toHaveProperty('author');
				expect(post).toHaveProperty('discipline');
			});
		});

		test('should return empty array for empty input', () => {
			expect(serializePosts([])).toEqual([]);
		});
	});
});
