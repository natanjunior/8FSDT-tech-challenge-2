'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		const postStatus = [
			{
				id: '770e8400-e29b-41d4-a716-446655440001',
				label: 'DRAFT',
				created_at: new Date()
			},
			{
				id: '770e8400-e29b-41d4-a716-446655440002',
				label: 'PUBLISHED',
				created_at: new Date()
			},
			{
				id: '770e8400-e29b-41d4-a716-446655440003',
				label: 'ARCHIVED',
				created_at: new Date()
			}
		];

		await queryInterface.bulkInsert('post_status', postStatus, {});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete('post_status', null, {});
	}
};
