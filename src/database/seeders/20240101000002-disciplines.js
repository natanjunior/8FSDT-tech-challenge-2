'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		const disciplines = [
			{
				id: '660e8400-e29b-41d4-a716-446655440001',
				label: 'Matemática',
				created_at: new Date()
			},
			{
				id: '660e8400-e29b-41d4-a716-446655440002',
				label: 'Português',
				created_at: new Date()
			},
			{
				id: '660e8400-e29b-41d4-a716-446655440003',
				label: 'Ciências',
				created_at: new Date()
			},
			{
				id: '660e8400-e29b-41d4-a716-446655440004',
				label: 'História',
				created_at: new Date()
			},
			{
				id: '660e8400-e29b-41d4-a716-446655440005',
				label: 'Geografia',
				created_at: new Date()
			}
		];

		await queryInterface.bulkInsert('disciplines', disciplines, {});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete('disciplines', null, {});
	}
};
