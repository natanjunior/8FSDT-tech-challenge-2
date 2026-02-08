'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		// 4 usuários: 2 TEACHER + 2 STUDENT (SEM campo password!)
		const users = [
			{
				id: '550e8400-e29b-41d4-a716-446655440001',
				name: 'Prof. João Silva',
				email: 'joao.silva@escola.com',
				role: 'TEACHER',
				created_at: new Date(),
				updated_at: new Date()
			},
			{
				id: '550e8400-e29b-41d4-a716-446655440002',
				name: 'Profa. Maria Santos',
				email: 'maria.santos@escola.com',
				role: 'TEACHER',
				created_at: new Date(),
				updated_at: new Date()
			},
			{
				id: '550e8400-e29b-41d4-a716-446655440003',
				name: 'Aluno Pedro Costa',
				email: 'pedro.costa@aluno.com',
				role: 'STUDENT',
				created_at: new Date(),
				updated_at: new Date()
			},
			{
				id: '550e8400-e29b-41d4-a716-446655440004',
				name: 'Aluna Ana Oliveira',
				email: 'ana.oliveira@aluno.com',
				role: 'STUDENT',
				created_at: new Date(),
				updated_at: new Date()
			}
		];

		await queryInterface.bulkInsert('users', users, {});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete('users', null, {});
	}
};
