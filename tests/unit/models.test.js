// Tests for Sequelize Models (v11 - Passwordless)
// Run with: npm test tests/unit/models.test.js

const { User, Post, Discipline, PostRead, UserSession } = require('../../src/models');

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
		test('should have correct attributes (WITHOUT deleted_at, WITH status ENUM)', () => {
			const attributes = Object.keys(Post.rawAttributes);

			expect(attributes).toContain('id');
			expect(attributes).toContain('title');
			expect(attributes).toContain('content');
			expect(attributes).toContain('author_id');
			expect(attributes).toContain('discipline_id');
			expect(attributes).toContain('status'); // v12: status ENUM field
			expect(attributes).toContain('published_at');

			// v11: SEM deleted_at (hard delete)!
			expect(attributes).not.toContain('deleted_at');
			// v12: SEM status_id (ENUM direto)!
			expect(attributes).not.toContain('status_id');
		});

		test('should have correct associations', () => {
			expect(Post.associations.author).toBeDefined();
			expect(Post.associations.discipline).toBeDefined();
			expect(Post.associations.reads).toBeDefined();
			// v12: NO status association (direct ENUM field)
		});

		test('should NOT have paranoid enabled (hard delete)', () => {
			// v11: Hard delete (paranoid mode must not be enabled)
			expect(Post.options.paranoid).not.toBe(true);
		});

		test('status should be ENUM with DRAFT, PUBLISHED, ARCHIVED', () => {
			// v12: status is now a direct ENUM field
			const statusType = Post.rawAttributes.status.type;
			expect(statusType.values).toEqual(['DRAFT', 'PUBLISHED', 'ARCHIVED']);
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

describe('Model Count - v12', () => {
	test('should have exactly 5 models (NO Comment, NO PostStatus)', () => {
		const models = require('../../src/models');
		const modelNames = Object.keys(models).filter(
			key => key !== 'sequelize' && key !== 'Sequelize'
		);

		// v12: 5 models (User, Post, PostRead, UserSession, Discipline)
		// SEM Comment (desde v11)!
		// SEM PostStatus (v12 - status é ENUM direto no Post)!
		expect(modelNames).toHaveLength(5);
		expect(modelNames).toContain('User');
		expect(modelNames).toContain('Post');
		expect(modelNames).toContain('PostRead');
		expect(modelNames).toContain('UserSession');
		expect(modelNames).toContain('Discipline');
		expect(modelNames).not.toContain('PostStatus');
		expect(modelNames).not.toContain('Comment');
	});
});
