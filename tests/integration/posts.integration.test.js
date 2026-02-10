const request = require('supertest');
const app = require('../../src/app');

describe('Posts Integration Tests', () => {
	let teacherToken;
	let studentToken;

	beforeAll(async () => {
		// Login teacher
		const teacherLogin = await request(app)
			.post('/auth/login')
			.send({ email: 'joao.silva@escola.com' });
		teacherToken = teacherLogin.body.token;

		// Login student
		const studentLogin = await request(app)
			.post('/auth/login')
			.send({ email: 'pedro.costa@aluno.com' });
		studentToken = studentLogin.body.token;
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
		test('deve retornar post específico com detalhes', async () => {
			const response = await request(app)
				.get('/posts/880e8400-e29b-41d4-a716-446655440001')
				.set('Authorization', `Bearer ${teacherToken}`);

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('id');
			expect(response.body).toHaveProperty('title');
			expect(response.body).toHaveProperty('author');
			expect(response.body).toHaveProperty('discipline');
			expect(response.body.status).toBe('PUBLISHED'); // v12: string direto
		});

		test('deve retornar 404 com id inválido', async () => {
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
					discipline_id: '660e8400-e29b-41d4-a716-446655440001',
					status: 'PUBLISHED' // v12: string ENUM
				});

			expect(response.status).toBe(201);
			expect(response.body.status).toBe('PUBLISHED'); // v12: string direto
			expect(response.body.published_at).not.toBeNull();
		});

		test('TEACHER deve criar post com status DRAFT', async () => {
			const response = await request(app)
				.post('/posts')
				.set('Authorization', `Bearer ${teacherToken}`)
				.send({
					title: 'Post Rascunho',
					content: 'Conteúdo de rascunho',
					discipline_id: '660e8400-e29b-41d4-a716-446655440001',
					status: 'DRAFT' // v12: string ENUM
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
					content: 'Conteúdo',
					discipline_id: '660e8400-e29b-41d4-a716-446655440001',
					status: 'PUBLISHED'
				});

			expect(response.status).toBe(403);
		});

		test('sem token não deve criar post (401)', async () => {
			const response = await request(app).post('/posts').send({
				title: 'Tentativa sem Auth',
				content: 'Conteúdo',
				status: 'PUBLISHED'
			});

			expect(response.status).toBe(401);
		});
	});

	describe('PUT /posts/:id', () => {
		test('TEACHER deve editar post (sem ownership check)', async () => {
			const response = await request(app)
				.put('/posts/880e8400-e29b-41d4-a716-446655440001')
				.set('Authorization', `Bearer ${teacherToken}`)
				.send({
					title: 'Título Editado via Teste'
				});

			expect(response.status).toBe(200);
			expect(response.body.title).toBe('Título Editado via Teste');
		});

		test('STUDENT não deve editar post (403)', async () => {
			const response = await request(app)
				.put('/posts/880e8400-e29b-41d4-a716-446655440001')
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
					content: 'Será deletado',
					discipline_id: '660e8400-e29b-41d4-a716-446655440001',
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
				.delete('/posts/880e8400-e29b-41d4-a716-446655440001')
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
});
