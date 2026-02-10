const request = require('supertest');
const app = require('../../src/app');

describe('Post Reads Integration Tests', () => {
	let token;
	const postId = '880e8400-e29b-41d4-a716-446655440001';

	beforeAll(async () => {
		const loginResponse = await request(app)
			.post('/auth/login')
			.send({ email: 'joao.silva@escola.com' });

		token = loginResponse.body.token;
	});

	describe('POST /posts/:id/read', () => {
		test('deve marcar post como lido (primeira vez)', async () => {
			const response = await request(app)
				.post(`/posts/${postId}/read`)
				.set('Authorization', `Bearer ${token}`);

			expect(response.status).toBe(201);
			expect(response.body).toHaveProperty('id');
			expect(response.body).toHaveProperty('post_id', postId);
			expect(response.body).toHaveProperty('user_id');
			expect(response.body).toHaveProperty('read_at');
		});

		test('deve ser idempotente (marcar 2x retorna mesmo registro)', async () => {
			// Primeira marcação
			const response1 = await request(app)
				.post(`/posts/${postId}/read`)
				.set('Authorization', `Bearer ${token}`);

			const firstId = response1.body.id;

			// Segunda marcação (mesmo post, mesmo usuário)
			const response2 = await request(app)
				.post(`/posts/${postId}/read`)
				.set('Authorization', `Bearer ${token}`);

			expect(response2.status).toBe(201);
			expect(response2.body.id).toBe(firstId); // Mesmo id (idempotente)
		});

		test('deve retornar 404 com post inexistente', async () => {
			const response = await request(app)
				.post('/posts/00000000-0000-0000-0000-000000000000/read')
				.set('Authorization', `Bearer ${token}`);

			expect(response.status).toBe(404);
		});

		test('deve retornar 401 sem token', async () => {
			const response = await request(app).post(`/posts/${postId}/read`);

			expect(response.status).toBe(401);
		});
	});

	describe('GET /posts/:id/read', () => {
		test('deve retornar read=true se post já foi lido', async () => {
			// Marcar como lido
			await request(app)
				.post(`/posts/${postId}/read`)
				.set('Authorization', `Bearer ${token}`);

			// Verificar
			const response = await request(app)
				.get(`/posts/${postId}/read`)
				.set('Authorization', `Bearer ${token}`);

			expect(response.status).toBe(200);
			expect(response.body.read).toBe(true);
			expect(response.body.read_at).not.toBeNull();
		});

		test('deve retornar read=false se post não foi lido', async () => {
			const unreadPostId = '880e8400-e29b-41d4-a716-446655440002';

			const response = await request(app)
				.get(`/posts/${unreadPostId}/read`)
				.set('Authorization', `Bearer ${token}`);

			expect(response.status).toBe(200);
			expect(response.body.read).toBe(false);
			expect(response.body.read_at).toBeNull();
		});

		test('deve retornar 401 sem token', async () => {
			const response = await request(app).get(`/posts/${postId}/read`);

			expect(response.status).toBe(401);
		});
	});
});
