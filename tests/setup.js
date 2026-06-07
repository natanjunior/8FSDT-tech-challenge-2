// Carregar variáveis de ambiente de teste
require('dotenv').config({ path: '.env.test' });

const bcrypt = require('bcrypt');
const {
	sequelize,
	User,
	Teacher,
	Student,
	Discipline,
	Post
} = require('../src/models');

// Seed compartilhado para suítes de integração que não fazem o próprio seed
// (ex.: disciplines). As suítes adaptadas (auth, teachers, students, posts,
// comments, reads) chamam sync({ force: true }) no próprio beforeAll e
// recriam os dados que precisam — para elas este seed é apenas redundante.
beforeAll(async () => {
	await sequelize.authenticate();
	await sequelize.sync({ force: true });

	const passwordHash = await bcrypt.hash('senha123', 10);

	// Credenciais (users) — login + senha (sem name/email)
	await User.bulkCreate([
		{
			id: '111e8400-e29b-41d4-a716-446655440001',
			login: 'joao.silva',
			password_hash: passwordHash,
			role: 'TEACHER'
		},
		{
			id: '111e8400-e29b-41d4-a716-446655440003',
			login: 'pedro.costa',
			password_hash: passwordHash,
			role: 'STUDENT'
		}
	]);

	// Perfis — PKs em Referência FHIR, vinculados às credenciais
	await Teacher.bulkCreate([
		{
			id: 'Teacher/550e8400-e29b-41d4-a716-446655440001',
			name: 'Prof. João Silva',
			email: 'joao.silva@escola.com',
			pronouns: 'ele/dele',
			status: 'ATIVO',
			user_id: '111e8400-e29b-41d4-a716-446655440001'
		}
	]);

	await Student.bulkCreate([
		{
			id: 'Student/550e8400-e29b-41d4-a716-446655440003',
			name: 'Pedro Costa',
			email: 'pedro.costa@aluno.com',
			pronouns: 'ele/dele',
			status: 'ATIVO',
			course: 'Ensino Médio - 2º Ano',
			user_id: '111e8400-e29b-41d4-a716-446655440003'
		}
	]);

	// Disciplinas
	await Discipline.bulkCreate([
		{ id: '660e8400-e29b-41d4-a716-446655440001', label: 'Matemática' },
		{ id: '660e8400-e29b-41d4-a716-446655440002', label: 'Português' },
		{ id: '660e8400-e29b-41d4-a716-446655440003', label: 'Ciências' },
		{ id: '660e8400-e29b-41d4-a716-446655440004', label: 'História' }
	]);

	// Posts (author = Referência FHIR do professor)
	await Post.bulkCreate([
		{
			id: '880e8400-e29b-41d4-a716-446655440001',
			title: 'Post Publicado',
			content: 'Conteúdo do post publicado para testes',
			author: 'Teacher/550e8400-e29b-41d4-a716-446655440001',
			discipline_id: '660e8400-e29b-41d4-a716-446655440001',
			status: 'PUBLISHED',
			published_at: new Date()
		},
		{
			id: '880e8400-e29b-41d4-a716-446655440002',
			title: 'Post Rascunho',
			content: 'Conteúdo do post rascunho para testes',
			author: 'Teacher/550e8400-e29b-41d4-a716-446655440001',
			discipline_id: '660e8400-e29b-41d4-a716-446655440002',
			status: 'DRAFT',
			published_at: null
		}
	]);
});

afterAll(async () => {
	await sequelize.close();
});
