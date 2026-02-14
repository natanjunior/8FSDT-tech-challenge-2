'use strict';

const axios = require('axios');

const BASE_URL = 'http://localhost:3030';
let authToken;

// Fazer login e obter token
async function login() {
	const response = await axios.post(`${BASE_URL}/auth/login`, {
		email: 'joao.silva@escola.com'
	});
	authToken = response.data.token;
	console.log('✅ Login realizado');
}

// Benchmark de um endpoint
async function benchmark(name, fn, iterations = 100) {
	console.log(`\n📊 Benchmark: ${name} (${iterations} requests)`);

	const times = [];

	for (let i = 0; i < iterations; i++) {
		const start = Date.now();
		try {
			await fn();
			const duration = Date.now() - start;
			times.push(duration);
		} catch (error) {
			console.error(`❌ Erro na iteração ${i}:`, error.message);
		}
	}

	// Estatísticas
	const avg = times.reduce((a, b) => a + b, 0) / times.length;
	const min = Math.min(...times);
	const max = Math.max(...times);
	const p95 = times.sort((a, b) => a - b)[Math.floor(times.length * 0.95)];

	console.log(`  Média: ${avg.toFixed(2)}ms`);
	console.log(`  Mínimo: ${min}ms`);
	console.log(`  Máximo: ${max}ms`);
	console.log(`  P95: ${p95}ms`);

	return { avg, min, max, p95 };
}

// Endpoints para testar
const endpoints = {
	'GET /posts (PUBLISHED)': async () => {
		await axios.get(`${BASE_URL}/posts`);
	},

	'GET /posts (TEACHER - all)': async () => {
		await axios.get(`${BASE_URL}/posts`, {
			headers: { Authorization: `Bearer ${authToken}` }
		});
	},

	'GET /posts/:id': async () => {
		await axios.get(`${BASE_URL}/posts/880e8400-e29b-41d4-a716-446655440001`, {
			headers: { Authorization: `Bearer ${authToken}` }
		});
	},

	'GET /posts/search?query=Node': async () => {
		await axios.get(`${BASE_URL}/posts/search?query=Node`, {
			headers: { Authorization: `Bearer ${authToken}` }
		});
	},

	'GET /disciplines': async () => {
		await axios.get(`${BASE_URL}/disciplines`, {
			headers: { Authorization: `Bearer ${authToken}` }
		});
	},

	'POST /posts/:id/read': async () => {
		await axios.post(`${BASE_URL}/posts/880e8400-e29b-41d4-a716-446655440001/read`, {}, {
			headers: { Authorization: `Bearer ${authToken}` }
		});
	}
};

// Rodar todos os benchmarks
async function runAll() {
	await login();

	const results = {};

	for (const [name, fn] of Object.entries(endpoints)) {
		results[name] = await benchmark(name, fn, 100);
	}

	console.log('\n\n📈 RESUMO FINAL:');
	console.log('═'.repeat(60));
	for (const [name, stats] of Object.entries(results)) {
		console.log(`${name}: ${stats.avg.toFixed(2)}ms (P95: ${stats.p95}ms)`);
	}
}

runAll().catch(console.error);
