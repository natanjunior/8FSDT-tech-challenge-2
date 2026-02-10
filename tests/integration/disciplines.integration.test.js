const request = require('supertest');
const app = require('../../src/app');

describe('Disciplines Integration Tests', () => {
	let token;

	beforeAll(async () => {
		const loginResponse = await request(app)
			.post('/auth/login')
			.send({ email: 'joao.silva@escola.com' });

		token = loginResponse.body.token;
	});

	describe('GET /disciplines', () => {
		test('deve retornar lista de disciplinas ordenadas', async () => {
			const response = await request(app)
				.get('/disciplines')
				.set('Authorization', `Bearer ${token}`);

			expect(response.status).toBe(200);
			expect(Array.isArray(response.body)).toBe(true);
			expect(response.body.length).toBeGreaterThan(0);

			// Verificar estrutura
			response.body.forEach((discipline) => {
				expect(discipline).toHaveProperty('id');
				expect(discipline).toHaveProperty('label');
				expect(discipline).toHaveProperty('createdAt');
			});

			// Verificar ordenação (alfabética)
			const labels = response.body.map((d) => d.label);
			const sortedLabels = [...labels].sort();
			expect(labels).toEqual(sortedLabels);
		});

		test('deve retornar 401 sem token', async () => {
			const response = await request(app).get('/disciplines');

			expect(response.status).toBe(401);
		});

		test('STUDENT deve poder listar disciplinas', async () => {
			// Login como student
			const studentLogin = await request(app)
				.post('/auth/login')
				.send({ email: 'pedro.costa@aluno.com' });

			const studentToken = studentLogin.body.token;

			const response = await request(app)
				.get('/disciplines')
				.set('Authorization', `Bearer ${studentToken}`);

			expect(response.status).toBe(200);
			expect(Array.isArray(response.body)).toBe(true);
		});
	});
});
