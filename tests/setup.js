// Carregar variáveis de ambiente de teste
require('dotenv').config({ path: '.env.test' });

const { sequelize, User, Discipline, Post } = require('../src/models');

beforeAll(async () => {
	// Conectar ao banco de teste
	await sequelize.authenticate();

	// Sincronizar schema (drop + create)
	await sequelize.sync({ force: true });

	// Criar usuários de teste
	await User.bulkCreate([
		{
			id: '550e8400-e29b-41d4-a716-446655440001',
			name: 'Prof. João Silva',
			email: 'joao.silva@escola.com',
			role: 'TEACHER'
		},
		{
			id: '550e8400-e29b-41d4-a716-446655440003',
			name: 'Aluno Pedro Costa',
			email: 'pedro.costa@aluno.com',
			role: 'STUDENT'
		}
	]);

	// Criar disciplinas
	await Discipline.bulkCreate([
		{ id: '660e8400-e29b-41d4-a716-446655440001', label: 'Matemática' },
		{ id: '660e8400-e29b-41d4-a716-446655440002', label: 'Português' }
	]);

	// Criar posts de teste
	await Post.bulkCreate([
		{
			id: '880e8400-e29b-41d4-a716-446655440001',
			title: 'Post Publicado',
			content: 'Conteúdo do post publicado para testes',
			author_id: '550e8400-e29b-41d4-a716-446655440001',
			discipline_id: '660e8400-e29b-41d4-a716-446655440001',
			status: 'PUBLISHED',
			published_at: new Date()
		},
		{
			id: '880e8400-e29b-41d4-a716-446655440002',
			title: 'Post Rascunho',
			content: 'Conteúdo do post rascunho para testes',
			author_id: '550e8400-e29b-41d4-a716-446655440001',
			discipline_id: '660e8400-e29b-41d4-a716-446655440002',
			status: 'DRAFT',
			published_at: null
		}
	]);
});

afterAll(async () => {
	// Fechar conexão
	await sequelize.close();
});
