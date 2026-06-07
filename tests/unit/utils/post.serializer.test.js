const { serializePost, serializePosts } = require('../../../src/utils/post.serializer');

describe('Post Serializer', () => {
	const mockPost = {
		id: '1',
		title: 'Test Post',
		content: 'Content here',
		author: 'Teacher/abc',
		discipline_id: 'disc-1',
		status: 'PUBLISHED',
		published_at: '2024-01-15T10:00:00Z',
		createdAt: '2024-01-15T10:00:00Z',
		updatedAt: '2024-01-15T10:00:00Z',
		author_teacher: { id: 'Teacher/abc', name: 'Teacher', pronouns: 'ele/dele' },
		discipline: { id: 'disc-1', label: 'Matemática' }
	};

	describe('serializePost()', () => {
		test('should remove author, author_teacher and discipline_id', () => {
			const result = serializePost(mockPost);

			expect(result).not.toHaveProperty('author_id');
			expect(result).not.toHaveProperty('author_teacher');
			expect(result).not.toHaveProperty('discipline_id');
		});

		test('should map author from author_teacher to {id,name,pronouns}', () => {
			const result = serializePost(mockPost);

			expect(result.author).toEqual({ id: 'Teacher/abc', name: 'Teacher', pronouns: 'ele/dele' });
			expect(result.discipline).toEqual({ id: 'disc-1', label: 'Matemática' });
		});

		test('should return author null when author_teacher is missing', () => {
			const { author_teacher, ...withoutTeacher } = mockPost;
			const result = serializePost(withoutTeacher);

			expect(result.author).toBeNull();
		});

		test('should map createdAt/updatedAt to created_at/updated_at', () => {
			const result = serializePost(mockPost);

			expect(result.created_at).toBe('2024-01-15T10:00:00Z');
			expect(result.updated_at).toBe('2024-01-15T10:00:00Z');
		});

		test('should keep all other fields', () => {
			const result = serializePost(mockPost);

			expect(result.id).toBe('1');
			expect(result.title).toBe('Test Post');
			expect(result.content).toBe('Content here');
			expect(result.status).toBe('PUBLISHED');
			expect(result.published_at).toBe('2024-01-15T10:00:00Z');
		});

		test('should expose comments_count and reads_count as integers', () => {
			const result = serializePost({ ...mockPost, comments_count: '3', reads_count: '5' });

			expect(result.comments_count).toBe(3);
			expect(result.reads_count).toBe(5);
		});

		test('should default counts to 0 when missing', () => {
			const result = serializePost(mockPost);

			expect(result.comments_count).toBe(0);
			expect(result.reads_count).toBe(0);
		});

		test('should handle Sequelize model instance with toJSON', () => {
			const sequelizePost = {
				...mockPost,
				toJSON: () => ({ ...mockPost })
			};

			const result = serializePost(sequelizePost);

			expect(result).not.toHaveProperty('author_teacher');
			expect(result).not.toHaveProperty('discipline_id');
			expect(result.author).toEqual({ id: 'Teacher/abc', name: 'Teacher', pronouns: 'ele/dele' });
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
				expect(post).not.toHaveProperty('author_teacher');
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
