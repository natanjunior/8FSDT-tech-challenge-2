// Tests for Sequelize Models (v11 - Passwordless)
// Run with: npm test tests/unit/models.test.js

const { User, Post, Discipline, PostStatus, PostRead, UserSession } = require('../../src/models');

describe('Models Definition - v11 (Passwordless)', () => {
	describe('User Model', () => {
		test('should have correct attributes (WITHOUT password)', () => {
			const attributes = Object.keys(User.rawAttributes);

			expect(attributes).toContain('id');
			expect(attributes).toContain('name');
			expect(attributes).toContain('email');
			expect(attributes).toContain('role');

			// v11: SEM password!
			expect(attributes).not.toContain('password');
		});

		test('should have correct associations', () => {
			expect(User.associations.posts).toBeDefined();
			expect(User.associations.post_reads).toBeDefined();
			expect(User.associations.sessions).toBeDefined();
		});

		test('role should be ENUM with TEACHER and STUDENT', () => {
			const roleType = User.rawAttributes.role.type;
			expect(roleType.values).toEqual(['TEACHER', 'STUDENT']);
		});
	});

	describe('Post Model', () => {
		test('should have correct attributes (WITHOUT deleted_at)', () => {
			const attributes = Object.keys(Post.rawAttributes);

			expect(attributes).toContain('id');
			expect(attributes).toContain('title');
			expect(attributes).toContain('content');
			expect(attributes).toContain('author_id');
			expect(attributes).toContain('discipline_id');
			expect(attributes).toContain('status_id');
			expect(attributes).toContain('published_at');

			// v11: SEM deleted_at (hard delete)!
			expect(attributes).not.toContain('deleted_at');
		});

		test('should have correct associations', () => {
			expect(Post.associations.author).toBeDefined();
			expect(Post.associations.discipline).toBeDefined();
			expect(Post.associations.status).toBeDefined();
			expect(Post.associations.reads).toBeDefined();
		});

		test('should NOT have paranoid enabled (hard delete)', () => {
			// v11: Hard delete (sem paranoid)
			expect(Post.options.paranoid).toBeUndefined();
		});

		test('title should have min 5 chars validation', () => {
			const titleValidation = Post.rawAttributes.title.validate;
			expect(titleValidation.len).toBeDefined();
			expect(titleValidation.len.args).toEqual([5, 255]);
		});
	});

	describe('Discipline Model', () => {
		test('should have correct attributes', () => {
			const attributes = Object.keys(Discipline.rawAttributes);

			expect(attributes).toContain('id');
			expect(attributes).toContain('label');
		});

		test('should have correct associations', () => {
			expect(Discipline.associations.posts).toBeDefined();
		});
	});

	describe('PostStatus Model', () => {
		test('should have correct attributes', () => {
			const attributes = Object.keys(PostStatus.rawAttributes);

			expect(attributes).toContain('id');
			expect(attributes).toContain('label');
		});

		test('should have correct associations', () => {
			expect(PostStatus.associations.posts).toBeDefined();
		});

		test('label should only accept DRAFT, PUBLISHED, ARCHIVED', () => {
			const labelValidation = PostStatus.rawAttributes.label.validate;
			expect(labelValidation.isIn).toBeDefined();
			expect(labelValidation.isIn.args).toEqual([['DRAFT', 'PUBLISHED', 'ARCHIVED']]);
		});
	});

	describe('PostRead Model', () => {
		test('should have correct attributes', () => {
			const attributes = Object.keys(PostRead.rawAttributes);

			expect(attributes).toContain('id');
			expect(attributes).toContain('post_id');
			expect(attributes).toContain('user_id');
			expect(attributes).toContain('read_at');
		});

		test('should have correct associations', () => {
			expect(PostRead.associations.post).toBeDefined();
			expect(PostRead.associations.user).toBeDefined();
		});

		test('should NOT have timestamps (uses read_at)', () => {
			expect(PostRead.options.timestamps).toBe(false);
		});
	});

	describe('UserSession Model', () => {
		test('should have correct attributes', () => {
			const attributes = Object.keys(UserSession.rawAttributes);

			expect(attributes).toContain('id');
			expect(attributes).toContain('user_id');
			expect(attributes).toContain('session_token');
			expect(attributes).toContain('expires_at');
		});

		test('should have correct associations', () => {
			expect(UserSession.associations.user).toBeDefined();
		});

		test('should have isExpired method', () => {
			expect(typeof UserSession.prototype.isExpired).toBe('function');
		});
	});
});

describe('Model Count - v11', () => {
	test('should have exactly 6 models (NO Comment model)', () => {
		const models = require('../../src/models');
		const modelNames = Object.keys(models).filter(
			key => key !== 'sequelize' && key !== 'Sequelize'
		);

		// v11: 6 models (User, Post, PostRead, UserSession, Discipline, PostStatus)
		// SEM Comment!
		expect(modelNames).toHaveLength(6);
		expect(modelNames).toContain('User');
		expect(modelNames).toContain('Post');
		expect(modelNames).toContain('PostRead');
		expect(modelNames).toContain('UserSession');
		expect(modelNames).toContain('Discipline');
		expect(modelNames).toContain('PostStatus');
		expect(modelNames).not.toContain('Comment');
	});
});
