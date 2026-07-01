'use strict';

const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../../src/app');
const db = require('../../src/models');

// IDs conhecidos usados nos testes (criados no beforeAll)
const DISCIPLINE_ID = '660e8400-e29b-41d4-a716-446655440001';
const TEACHER_ID = 'Teacher/550e8400-e29b-41d4-a716-446655440001';
const POST_PUBLISHED_ID = '880e8400-e29b-41d4-a716-446655440001';
const POST_EDITABLE_ID = '880e8400-e29b-41d4-a716-446655440003';
const POST_DRAFT_ID = '880e8400-e29b-41d4-a716-446655440005';

describe('Posts Integration Tests', () => {
	let teacherToken;
	let studentToken;

	beforeAll(async () => {
		await db.sequelize.sync({ force: true });

		const hash = await bcrypt.hash('senha123', 10);

		// Disciplina conhecida
		await db.Discipline.create({ id: DISCIPLINE_ID, label: 'Matemática' });

		// Usuário + perfil TEACHER (necessário para criar posts via profileId)
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
			name: 'Pedro Costa',
			status: 'ATIVO',
			user_id: studentUser.id
		});

		// Posts conhecidos para os casos GET/PUT/PATCH/DELETE por id
		await db.Post.create({
			id: POST_PUBLISHED_ID,
			title: 'Post Publicado de Exemplo',
			content: 'Conteúdo do post publicado com mais de 10 caracteres',
			author: TEACHER_ID,
			discipline_id: DISCIPLINE_ID,
			status: 'PUBLISHED',
			published_at: new Date()
		});
		await db.Post.create({
			id: POST_EDITABLE_ID,
			title: 'Post Editável de Exemplo',
			content: 'Conteúdo do post editável com mais de 10 caracteres',
			author: TEACHER_ID,
			discipline_id: DISCIPLINE_ID,
			status: 'PUBLISHED',
			published_at: new Date()
		});
		await db.Post.create({
			id: POST_DRAFT_ID,
			title: 'Post Rascunho de Exemplo',
			content: 'Conteúdo do post rascunho com mais de 10 caracteres',
			author: TEACHER_ID,
			discipline_id: DISCIPLINE_ID,
			status: 'DRAFT',
			published_at: null
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

	describe('GET /posts', () => {
		test('sem token deve retornar apenas posts PUBLISHED', async () => {
			const response = await request(app).get('/posts');

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('data');
			expect(response.body).toHaveProperty('pagination');

			// Todos devem ser PUBLISHED
			response.body.data.forEach((post) => {
				expect(post.status).toBe('PUBLISHED');
				// Não deve conter campos de FK redundantes
				expect(post).not.toHaveProperty('author_id');
				expect(post).not.toHaveProperty('discipline_id');
				// Deve conter objetos aninhados
				expect(post).toHaveProperty('author');
				expect(post).toHaveProperty('discipline');
			});
		});

		test('STUDENT deve ver apenas posts PUBLISHED', async () => {
			const response = await request(app)
				.get('/posts')
				.set('Authorization', `Bearer ${studentToken}`);

			expect(response.status).toBe(200);
			response.body.data.forEach((post) => {
				expect(post.status).toBe('PUBLISHED');
			});
		});

		test('TEACHER deve ver todos os posts (incluindo DRAFT)', async () => {
			const response = await request(app)
				.get('/posts')
				.set('Authorization', `Bearer ${teacherToken}`);

			expect(response.status).toBe(200);

			// Deve incluir tanto PUBLISHED quanto DRAFT
			const statuses = response.body.data.map((p) => p.status);
			expect(statuses).toContain('PUBLISHED');
			expect(statuses).toContain('DRAFT');
		});
	});

	describe('GET /posts/:id', () => {
		test('TEACHER deve retornar post PUBLISHED com detalhes', async () => {
			const response = await request(app)
				.get(`/posts/${POST_PUBLISHED_ID}`)
				.set('Authorization', `Bearer ${teacherToken}`);

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('id');
			expect(response.body).toHaveProperty('title');
			expect(response.body).toHaveProperty('author');
			expect(response.body.author).toHaveProperty('id');
			expect(response.body.author).toHaveProperty('name');
			expect(response.body.author).toHaveProperty('pronouns');
			// author não expõe mais email nem role
			expect(response.body.author).not.toHaveProperty('email');
			expect(response.body.author).not.toHaveProperty('role');
			expect(response.body).toHaveProperty('discipline');
			expect(response.body.discipline).toHaveProperty('id');
			expect(response.body.discipline).toHaveProperty('label');
			expect(response.body).not.toHaveProperty('author_id');
			expect(response.body).not.toHaveProperty('discipline_id');
			expect(response.body.status).toBe('PUBLISHED');
		});

		test('sem token deve retornar post PUBLISHED (200)', async () => {
			const response = await request(app).get(`/posts/${POST_PUBLISHED_ID}`);

			expect(response.status).toBe(200);
			expect(response.body.status).toBe('PUBLISHED');
			expect(response.body).toHaveProperty('author');
			expect(response.body).toHaveProperty('discipline');
		});

		test('sem token deve retornar 403 para post DRAFT', async () => {
			const response = await request(app).get(`/posts/${POST_DRAFT_ID}`);

			expect(response.status).toBe(403);
			expect(response.body).toHaveProperty('error');
		});

		test('STUDENT deve retornar post PUBLISHED (200)', async () => {
			const response = await request(app)
				.get(`/posts/${POST_PUBLISHED_ID}`)
				.set('Authorization', `Bearer ${studentToken}`);

			expect(response.status).toBe(200);
			expect(response.body.status).toBe('PUBLISHED');
		});

		test('STUDENT deve retornar 403 para post DRAFT', async () => {
			const response = await request(app)
				.get(`/posts/${POST_DRAFT_ID}`)
				.set('Authorization', `Bearer ${studentToken}`);

			expect(response.status).toBe(403);
			expect(response.body).toHaveProperty('error');
		});

		test('TEACHER deve retornar post DRAFT (200)', async () => {
			const response = await request(app)
				.get(`/posts/${POST_DRAFT_ID}`)
				.set('Authorization', `Bearer ${teacherToken}`);

			expect(response.status).toBe(200);
			expect(response.body.status).toBe('DRAFT');
		});

		test('deve retornar 404 com id inexistente', async () => {
			const response = await request(app)
				.get('/posts/00000000-0000-0000-0000-000000000000')
				.set('Authorization', `Bearer ${teacherToken}`);

			expect(response.status).toBe(404);
		});
	});

	describe('POST /posts', () => {
		test('TEACHER deve criar post com status PUBLISHED', async () => {
			const response = await request(app)
				.post('/posts')
				.set('Authorization', `Bearer ${teacherToken}`)
				.send({
					title: 'Novo Post de Teste',
					content: 'Conteúdo do novo post de teste com mais de 10 caracteres',
					discipline_id: DISCIPLINE_ID,
					status: 'PUBLISHED'
				});

			expect(response.status).toBe(201);
			expect(response.body.status).toBe('PUBLISHED');
			expect(response.body.published_at).not.toBeNull();
			expect(response.body).not.toHaveProperty('author_id');
			expect(response.body).not.toHaveProperty('discipline_id');
			expect(response.body).toHaveProperty('author');
			// author derivado do token: shape { id, name, pronouns }
			expect(response.body.author).toHaveProperty('id');
			expect(response.body.author).toHaveProperty('name');
			expect(response.body.author).toHaveProperty('pronouns');
			expect(response.body.author.id).toBe(TEACHER_ID);
			expect(response.body).toHaveProperty('discipline');
		});

		test('TEACHER deve criar post com status DRAFT', async () => {
			const response = await request(app)
				.post('/posts')
				.set('Authorization', `Bearer ${teacherToken}`)
				.send({
					title: 'Post Rascunho Novo',
					content: 'Conteúdo de rascunho com mais de 10 caracteres',
					discipline_id: DISCIPLINE_ID,
					status: 'DRAFT'
				});

			expect(response.status).toBe(201);
			expect(response.body.status).toBe('DRAFT');
			expect(response.body.published_at).toBeNull();
		});

		test('STUDENT não deve criar post (403)', async () => {
			const response = await request(app)
				.post('/posts')
				.set('Authorization', `Bearer ${studentToken}`)
				.send({
					title: 'Tentativa de Post',
					content: 'Conteúdo com mais de 10 caracteres',
					discipline_id: DISCIPLINE_ID,
					status: 'PUBLISHED'
				});

			expect(response.status).toBe(403);
		});

		test('sem token não deve criar post (401)', async () => {
			const response = await request(app).post('/posts').send({
				title: 'Tentativa sem Auth',
				content: 'Conteúdo com mais de 10 caracteres',
				status: 'PUBLISHED'
			});

			expect(response.status).toBe(401);
		});
	});

	describe('PUT /posts/:id', () => {
		test('TEACHER deve substituir post completamente', async () => {
			const response = await request(app)
				.put(`/posts/${POST_EDITABLE_ID}`)
				.set('Authorization', `Bearer ${teacherToken}`)
				.send({
					title: 'Título Substituído Completo',
					content: 'Conteúdo completamente substituído via teste',
					status: 'DRAFT'
				});

			expect(response.status).toBe(200);
			expect(response.body.title).toBe('Título Substituído Completo');
			expect(response.body.content).toBe('Conteúdo completamente substituído via teste');
			expect(response.body.status).toBe('DRAFT');
		});

		test('PUT sem campo obrigatório deve retornar 400', async () => {
			const response = await request(app)
				.put(`/posts/${POST_EDITABLE_ID}`)
				.set('Authorization', `Bearer ${teacherToken}`)
				.send({
					title: 'Apenas Título'
				});

			expect(response.status).toBe(400);
		});

		test('STUDENT não deve substituir post (403)', async () => {
			const response = await request(app)
				.put(`/posts/${POST_EDITABLE_ID}`)
				.set('Authorization', `Bearer ${studentToken}`)
				.send({
					title: 'Tentativa de Substituição',
					content: 'Conteúdo da tentativa de substituição',
					status: 'DRAFT'
				});

			expect(response.status).toBe(403);
		});

		test('PUT sem discipline_id deve setar como null', async () => {
			const response = await request(app)
				.put(`/posts/${POST_EDITABLE_ID}`)
				.set('Authorization', `Bearer ${teacherToken}`)
				.send({
					title: 'Post Sem Disciplina Teste',
					content: 'Conteúdo sem disciplina definida',
					status: 'DRAFT'
				});

			expect(response.status).toBe(200);
			expect(response.body.discipline).toBeNull();
		});
	});

	describe('PATCH /posts/:id', () => {
		test('TEACHER deve editar post parcialmente (sem ownership check)', async () => {
			const response = await request(app)
				.patch(`/posts/${POST_EDITABLE_ID}`)
				.set('Authorization', `Bearer ${teacherToken}`)
				.send({
					title: 'Título Editado via Teste'
				});

			expect(response.status).toBe(200);
			expect(response.body.title).toBe('Título Editado via Teste');
			expect(response.body).not.toHaveProperty('author_id');
			expect(response.body).not.toHaveProperty('discipline_id');
		});

		test('STUDENT não deve editar post (403)', async () => {
			const response = await request(app)
				.patch(`/posts/${POST_EDITABLE_ID}`)
				.set('Authorization', `Bearer ${studentToken}`)
				.send({
					title: 'Tentativa de Edição'
				});

			expect(response.status).toBe(403);
		});
	});

	describe('DELETE /posts/:id', () => {
		test('TEACHER deve deletar post (hard delete)', async () => {
			// Criar post para deletar
			const createResponse = await request(app)
				.post('/posts')
				.set('Authorization', `Bearer ${teacherToken}`)
				.send({
					title: 'Post para Deletar',
					content: 'Será deletado com mais de 10 caracteres',
					discipline_id: DISCIPLINE_ID,
					status: 'DRAFT'
				});

			const postId = createResponse.body.id;

			// Deletar
			const deleteResponse = await request(app)
				.delete(`/posts/${postId}`)
				.set('Authorization', `Bearer ${teacherToken}`);

			expect(deleteResponse.status).toBe(204);

			// Verificar que não existe mais (404)
			const getResponse = await request(app)
				.get(`/posts/${postId}`)
				.set('Authorization', `Bearer ${teacherToken}`);

			expect(getResponse.status).toBe(404);
		});

		test('STUDENT não deve deletar post (403)', async () => {
			const response = await request(app)
				.delete(`/posts/${POST_PUBLISHED_ID}`)
				.set('Authorization', `Bearer ${studentToken}`);

			expect(response.status).toBe(403);
		});
	});

	describe('GET /posts/search', () => {
		test('sem parâmetros deve listar todos (como GET /posts)', async () => {
			const response = await request(app)
				.get('/posts/search')
				.set('Authorization', `Bearer ${teacherToken}`);

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('data');
			expect(response.body).toHaveProperty('pagination');
		});

		test('com query deve filtrar por título ou conteúdo', async () => {
			const response = await request(app)
				.get('/posts/search?query=Publicado')
				.set('Authorization', `Bearer ${teacherToken}`);

			expect(response.status).toBe(200);
			// Deve conter posts com "Publicado" no título ou conteúdo
			expect(response.body.data.length).toBeGreaterThan(0);
		});

		test('STUDENT em search deve ver apenas PUBLISHED', async () => {
			const response = await request(app)
				.get('/posts/search?query=Post')
				.set('Authorization', `Bearer ${studentToken}`);

			expect(response.status).toBe(200);
			response.body.data.forEach((post) => {
				expect(post.status).toBe('PUBLISHED');
			});
		});
	});

	describe('GET /posts — sort', () => {
		test('sort=-published_at retorna posts ordenados por published_at DESC', async () => {
			const response = await request(app).get('/posts?sort=-published_at');

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('data');
			const dates = response.body.data
				.map((p) => p.published_at)
				.filter(Boolean);
			for (let i = 1; i < dates.length; i++) {
				expect(new Date(dates[i - 1]).getTime()).toBeGreaterThanOrEqual(
					new Date(dates[i]).getTime()
				);
			}
		});

		test('sort=title retorna posts ordenados por título ASC', async () => {
			const response = await request(app)
				.get('/posts?sort=title')
				.set('Authorization', `Bearer ${teacherToken}`);

			expect(response.status).toBe(200);
			const titles = response.body.data.map((p) => p.title);
			for (let i = 1; i < titles.length; i++) {
				expect(titles[i - 1].localeCompare(titles[i])).toBeLessThanOrEqual(0);
			}
		});

		test('sort campo inválido retorna 200 com ordem default', async () => {
			const response = await request(app).get('/posts?sort=campo_invalido');
			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('data');
		});
	});

	describe('GET /posts/search — discipline e status', () => {
		test('?discipline=<uuid> retorna apenas posts da disciplina', async () => {
			const response = await request(app)
				.get(`/posts/search?discipline=${DISCIPLINE_ID}`)
				.set('Authorization', `Bearer ${teacherToken}`);

			expect(response.status).toBe(200);
			response.body.data.forEach((post) => {
				expect(post.discipline.id).toBe(DISCIPLINE_ID);
			});
		});

		test('?discipline=uuid_inexistente retorna 0 resultados', async () => {
			const response = await request(app)
				.get('/posts/search?discipline=00000000-0000-0000-0000-000000000000')
				.set('Authorization', `Bearer ${teacherToken}`);

			expect(response.status).toBe(200);
			expect(response.body.pagination.total).toBe(0);
		});

		test('?discipline=invalido retorna 400', async () => {
			const response = await request(app).get('/posts/search?discipline=nao-e-uuid');
			expect(response.status).toBe(400);
		});

		test('?status=DRAFT como TEACHER retorna rascunhos', async () => {
			const response = await request(app)
				.get('/posts/search?status=DRAFT')
				.set('Authorization', `Bearer ${teacherToken}`);

			expect(response.status).toBe(200);
			response.body.data.forEach((post) => {
				expect(post.status).toBe('DRAFT');
			});
		});

		test('?status=DRAFT como STUDENT retorna apenas PUBLISHED', async () => {
			const response = await request(app)
				.get('/posts/search?status=DRAFT')
				.set('Authorization', `Bearer ${studentToken}`);

			expect(response.status).toBe(200);
			response.body.data.forEach((post) => {
				expect(post.status).toBe('PUBLISHED');
			});
		});

		test('?status=draft (minúsculo) é aceito e normalizado', async () => {
			const response = await request(app)
				.get('/posts/search?status=draft')
				.set('Authorization', `Bearer ${teacherToken}`);

			expect(response.status).toBe(200);
			response.body.data.forEach((post) => {
				expect(post.status).toBe('DRAFT');
			});
		});
	});

	describe('GET /posts — counts no shape', () => {
		test('cada post deve conter comments_count e reads_count como números', async () => {
			const response = await request(app).get('/posts');

			expect(response.status).toBe(200);
			response.body.data.forEach((post) => {
				expect(post).toHaveProperty('comments_count');
				expect(post).toHaveProperty('reads_count');
				expect(typeof post.comments_count).toBe('number');
				expect(typeof post.reads_count).toBe('number');
				expect(post.comments_count).toBeGreaterThanOrEqual(0);
				expect(post.reads_count).toBeGreaterThanOrEqual(0);
			});
		});

		test('GET /posts/:id deve conter comments_count e reads_count', async () => {
			const listResponse = await request(app).get('/posts');
			const postId = listResponse.body.data[0]?.id;

			const response = await request(app).get(`/posts/${postId}`);

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('comments_count');
			expect(response.body).toHaveProperty('reads_count');
			expect(typeof response.body.comments_count).toBe('number');
			expect(typeof response.body.reads_count).toBe('number');
		});

		test('GET /posts/search deve conter comments_count e reads_count', async () => {
			const response = await request(app).get('/posts/search');

			expect(response.status).toBe(200);
			response.body.data.forEach((post) => {
				expect(post).toHaveProperty('comments_count');
				expect(post).toHaveProperty('reads_count');
				expect(typeof post.comments_count).toBe('number');
				expect(typeof post.reads_count).toBe('number');
			});
		});
	});
});
