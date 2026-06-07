// Tests for Sequelize Models (Fase 4 - profiles, login+password, FHIR refs)
// Run with: npm test tests/unit/models.test.js

const { User, Post, Discipline, PostRead, UserSession } = require('../../src/models');

describe('Models Definition - Fase 4', () => {
	describe('User Model', () => {
		test('should have correct attributes (login + password_hash, NO name/email)', () => {
			const attributes = Object.keys(User.rawAttributes);

			expect(attributes).toContain('id');
			expect(attributes).toContain('login');
			expect(attributes).toContain('password_hash');
			expect(attributes).toContain('role');

			// Fase 4: name/email moved to Teacher/Student profiles
			expect(attributes).not.toContain('name');
			expect(attributes).not.toContain('email');
		});

		test('should have correct associations (teacher, student, sessions)', () => {
			expect(User.associations.teacher).toBeDefined();
			expect(User.associations.student).toBeDefined();
			expect(User.associations.sessions).toBeDefined();
		});

		test('role should be ENUM with TEACHER and STUDENT', () => {
			const roleType = User.rawAttributes.role.type;
			expect(roleType.values).toEqual(['TEACHER', 'STUDENT']);
		});

		test('defaultScope should exclude password_hash', () => {
			expect(User.options.defaultScope.attributes.exclude).toContain('password_hash');
		});
	});

	describe('Post Model', () => {
		test('should have correct attributes (author STRING FK, status ENUM, NO deleted_at)', () => {
			const attributes = Object.keys(Post.rawAttributes);

			expect(attributes).toContain('id');
			expect(attributes).toContain('title');
			expect(attributes).toContain('content');
			expect(attributes).toContain('author'); // Fase 4: author (STRING FHIR ref) replaced author_id
			expect(attributes).toContain('discipline_id');
			expect(attributes).toContain('status');
			expect(attributes).toContain('published_at');

			// Fase 4: author replaced author_id
			expect(attributes).not.toContain('author_id');
			// Hard delete (no deleted_at)
			expect(attributes).not.toContain('deleted_at');
			// status is ENUM direct (no status_id)
			expect(attributes).not.toContain('status_id');
		});

		test('should have correct associations (author_teacher, discipline, reads, comments)', () => {
			expect(Post.associations.author_teacher).toBeDefined();
			expect(Post.associations.discipline).toBeDefined();
			expect(Post.associations.reads).toBeDefined();
			expect(Post.associations.comments).toBeDefined();
		});

		test('should NOT have paranoid enabled (hard delete)', () => {
			expect(Post.options.paranoid).not.toBe(true);
		});

		test('status should be ENUM with DRAFT, PUBLISHED, ARCHIVED', () => {
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
		test('should have correct attributes (reader FHIR ref)', () => {
			const attributes = Object.keys(PostRead.rawAttributes);

			expect(attributes).toContain('id');
			expect(attributes).toContain('post_id');
			expect(attributes).toContain('reader'); // Fase 4: reader replaced user_id
			expect(attributes).toContain('read_at');

			expect(attributes).not.toContain('user_id');
		});

		test('should have correct associations', () => {
			expect(PostRead.associations.post).toBeDefined();
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

describe('Model Count - Fase 4', () => {
	test('should have exactly 9 models', () => {
		const models = require('../../src/models');
		const modelNames = Object.keys(models).filter(
			key => key !== 'sequelize' && key !== 'Sequelize'
		);

		// Fase 4: User, Teacher, Student, TeacherDiscipline, Post, Comment, PostRead, Discipline, UserSession
		expect(modelNames).toHaveLength(9);
		expect(modelNames).toContain('User');
		expect(modelNames).toContain('Teacher');
		expect(modelNames).toContain('Student');
		expect(modelNames).toContain('TeacherDiscipline');
		expect(modelNames).toContain('Post');
		expect(modelNames).toContain('Comment');
		expect(modelNames).toContain('PostRead');
		expect(modelNames).toContain('Discipline');
		expect(modelNames).toContain('UserSession');
		expect(modelNames).not.toContain('PostStatus');
	});
});
