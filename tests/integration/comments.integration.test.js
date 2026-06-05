'use strict';

const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../../src/app');
const db = require('../../src/models');

// IDs conhecidos usados nos testes (criados no beforeAll)
const DISCIPLINE_ID = '660e8400-e29b-41d4-a716-446655440001';
const TEACHER_ID = 'Teacher/550e8400-e29b-41d4-a716-446655440001';
const STUDENT_ID = 'Student/550e8400-e29b-41d4-a716-446655440003';
const POST_PUBLISHED_ID = '880e8400-e29b-41d4-a716-446655440001';

describe('Comments Integration Tests', () => {
	let teacherToken;
	let studentToken;
	let teacherCommentId;
	let studentCommentId;

	beforeAll(async () => {
		await db.sequelize.sync({ force: true });

		const hash = await bcrypt.hash('senha123', 10);

		// Disciplina conhecida
		await db.Discipline.create({ id: DISCIPLINE_ID, label: 'Matemática' });

		// Usuário + perfil TEACHER
		const teacherUser = await db.User.create({
			login: 'joao.silva',
			password_hash: hash,
			role: 'TEACHER'
		});
		await db.Teacher.create({
			id: TEACHER_ID,
			name: 'João Silva',
			pronouns: 'ele/dele',
			status: 'ATIVO',
			user_id: teacherUser.id
		});

		// Usuário + perfil STUDENT
		const studentUser = await db.User.create({
			login: 'pedro.costa',
			password_hash: hash,
			role: 'STUDENT'
		});
		await db.Student.create({
			id: STUDENT_ID,
			name: 'Pedro Costa',
			status: 'ATIVO',
			user_id: studentUser.id
		});

		// Post publicado para anexar comentários
		await db.Post.create({
			id: POST_PUBLISHED_ID,
			title: 'Post Publicado de Exemplo',
			content: 'Conteúdo do post publicado com mais de 10 caracteres',
			author: TEACHER_ID,
			discipline_id: DISCIPLINE_ID,
			status: 'PUBLISHED',
			published_at: new Date()
		});

		// Tokens via login + password
		const teacherLogin = await request(app)
			.post('/auth/login')
			.send({ login: 'joao.silva', password: 'senha123' });
		teacherToken = teacherLogin.body.token;

		const studentLogin = await request(app)
			.post('/auth/login')
			.send({ login: 'pedro.costa', password: 'senha123' });
		studentToken = studentLogin.body.token;
	});

	afterAll(async () => {
		await db.sequelize.close();
	});

	describe('POST /comments', () => {
		test('sem token retorna 401', async () => {
			const response = await request(app)
				.post('/comments')
				.send({ post_id: POST_PUBLISHED_ID, content: 'Comentário sem auth' });

			expect(response.status).toBe(401);
		});

		test('sem post_id retorna 400', async () => {
			const response = await request(app)
				.post('/comments')
				.set('Authorization', `Bearer ${teacherToken}`)
				.send({ content: 'Conteúdo válido' });

			expect(response.status).toBe(400);
		});

		test('content vazio retorna 400', async () => {
			const response = await request(app)
				.post('/comments')
				.set('Authorization', `Bearer ${teacherToken}`)
				.send({ post_id: POST_PUBLISHED_ID, content: '' });

			expect(response.status).toBe(400);
		});

		test('post inexistente retorna 404', async () => {
			const response = await request(app)
				.post('/comments')
				.set('Authorization', `Bearer ${teacherToken}`)
				.send({
					post_id: '00000000-0000-0000-0000-000000000000',
					content: 'Comentário teste'
				});

			expect(response.status).toBe(404);
		});

		test('TEACHER autenticado cria comentário (201) com author Teacher', async () => {
			const response = await request(app)
				.post('/comments')
				.set('Authorization', `Bearer ${teacherToken}`)
				.send({ post_id: POST_PUBLISHED_ID, content: 'Comentário do professor' });

			expect(response.status).toBe(201);
			expect(response.body).toHaveProperty('id');
			expect(response.body.content).toBe('Comentário do professor');
			expect(response.body).toHaveProperty('author');
			expect(response.body.author).toMatchObject({
				id: TEACHER_ID,
				type: 'Teacher'
			});
			expect(response.body.author).toHaveProperty('name');
			expect(response.body.can_delete).toBe(true);
			// Não deve expor campos do contrato antigo
			expect(response.body).not.toHaveProperty('is_anonymous');
			expect(response.body).not.toHaveProperty('author_name');
			teacherCommentId = response.body.id;
		});

		test('STUDENT autenticado cria comentário (201) com author Student', async () => {
			const response = await request(app)
				.post('/comments')
				.set('Authorization', `Bearer ${studentToken}`)
				.send({ post_id: POST_PUBLISHED_ID, content: 'Comentário do aluno' });

			expect(response.status).toBe(201);
			expect(response.body).toHaveProperty('id');
			expect(response.body.author).toMatchObject({
				id: STUDENT_ID,
				type: 'Student'
			});
			expect(response.body.can_delete).toBe(true);
			studentCommentId = response.body.id;
		});
	});

	describe('GET /comments/search', () => {
		test('retorna comentários do post com paginação', async () => {
			const response = await request(app).get(
				`/comments/search?post_id=${POST_PUBLISHED_ID}`
			);

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('data');
			expect(response.body).toHaveProperty('pagination');
			expect(Array.isArray(response.body.data)).toBe(true);
			expect(response.body.pagination.total).toBeGreaterThanOrEqual(2);

			// Shape dos itens: sem campos do contrato antigo
			response.body.data.forEach((c) => {
				expect(c).toHaveProperty('content');
				expect(c).toHaveProperty('author');
				expect(c).toHaveProperty('can_delete');
				expect(c).toHaveProperty('created_at');
				expect(c).not.toHaveProperty('is_anonymous');
				expect(c).not.toHaveProperty('author_name');
			});
		});

		test('post_id inválido retorna 400', async () => {
			const response = await request(app).get('/comments/search?post_id=nao-uuid');
			expect(response.status).toBe(400);
		});

		test('can_delete true para o próprio comentário do STUDENT', async () => {
			const response = await request(app)
				.get(`/comments/search?post_id=${POST_PUBLISHED_ID}`)
				.set('Authorization', `Bearer ${studentToken}`);

			const own = response.body.data.find((c) => c.id === studentCommentId);
			expect(own).toBeDefined();
			expect(own.can_delete).toBe(true);
		});

		test('can_delete false para comentário de outro (STUDENT vê comentário do TEACHER)', async () => {
			const response = await request(app)
				.get(`/comments/search?post_id=${POST_PUBLISHED_ID}`)
				.set('Authorization', `Bearer ${studentToken}`);

			const other = response.body.data.find((c) => c.id === teacherCommentId);
			expect(other).toBeDefined();
			expect(other.can_delete).toBe(false);
		});

		test('can_delete sempre true para TEACHER (qualquer comentário)', async () => {
			const response = await request(app)
				.get(`/comments/search?post_id=${POST_PUBLISHED_ID}`)
				.set('Authorization', `Bearer ${teacherToken}`);

			response.body.data.forEach((c) => {
				expect(c.can_delete).toBe(true);
			});
		});
	});

	describe('DELETE /comments/:id', () => {
		test('sem token retorna 401', async () => {
			const response = await request(app).delete(`/comments/${studentCommentId}`);
			expect(response.status).toBe(401);
		});

		test('STUDENT não pode deletar comentário de outro usuário (403)', async () => {
			const response = await request(app)
				.delete(`/comments/${teacherCommentId}`)
				.set('Authorization', `Bearer ${studentToken}`);

			expect(response.status).toBe(403);
		});

		test('dono (STUDENT) pode deletar seu próprio comentário (204)', async () => {
			const response = await request(app)
				.delete(`/comments/${studentCommentId}`)
				.set('Authorization', `Bearer ${studentToken}`);

			expect(response.status).toBe(204);
		});

		test('TEACHER pode deletar qualquer comentário (204)', async () => {
			// Cria um comentário de aluno para o teacher deletar
			const createResponse = await request(app)
				.post('/comments')
				.set('Authorization', `Bearer ${studentToken}`)
				.send({ post_id: POST_PUBLISHED_ID, content: 'Comentário a ser removido pelo teacher' });

			const targetId = createResponse.body.id;

			const response = await request(app)
				.delete(`/comments/${targetId}`)
				.set('Authorization', `Bearer ${teacherToken}`);

			expect(response.status).toBe(204);
		});

		test('comentário inexistente retorna 404', async () => {
			const response = await request(app)
				.delete('/comments/00000000-0000-0000-0000-000000000000')
				.set('Authorization', `Bearer ${teacherToken}`);

			expect(response.status).toBe(404);
		});
	});
});
