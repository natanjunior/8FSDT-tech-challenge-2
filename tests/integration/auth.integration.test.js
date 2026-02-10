const request = require('supertest');
const app = require('../../src/app');

describe('Auth Integration Tests', () => {
	describe('POST /auth/login', () => {
		test('deve fazer login com email válido', async () => {
			const response = await request(app)
				.post('/auth/login')
				.send({ email: 'joao.silva@escola.com' });

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('user');
			expect(response.body).toHaveProperty('token');
			expect(response.body.user.email).toBe('joao.silva@escola.com');
			expect(response.body.user.role).toBe('TEACHER');
		});

		test('deve retornar 404 com email inexistente', async () => {
			const response = await request(app)
				.post('/auth/login')
				.send({ email: 'naoexiste@email.com' });

			expect(response.status).toBe(404);
			expect(response.body).toHaveProperty('error');
		});

		test('deve retornar 400 sem email', async () => {
			const response = await request(app).post('/auth/login').send({});

			expect(response.status).toBe(400);
		});
	});

	describe('POST /auth/logout', () => {
		let token;

		beforeEach(async () => {
			// Fazer login para obter token
			const loginResponse = await request(app)
				.post('/auth/login')
				.send({ email: 'joao.silva@escola.com' });

			token = loginResponse.body.token;
		});

		test('deve fazer logout com token válido', async () => {
			const response = await request(app)
				.post('/auth/logout')
				.set('Authorization', `Bearer ${token}`);

			expect(response.status).toBe(204);
		});

		test('deve retornar 401 sem token', async () => {
			const response = await request(app).post('/auth/logout');

			expect(response.status).toBe(401);
		});

		test('deve retornar 401 após logout (token invalidado)', async () => {
			// Fazer logout
			await request(app)
				.post('/auth/logout')
				.set('Authorization', `Bearer ${token}`);

			// Tentar usar token novamente
			const response = await request(app)
				.post('/auth/logout')
				.set('Authorization', `Bearer ${token}`);

			expect(response.status).toBe(401);
		});
	});
});
