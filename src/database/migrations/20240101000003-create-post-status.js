'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('post_status', {
			id: {
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUIDV4,
				primaryKey: true,
				allowNull: false
			},
			label: {
				type: Sequelize.STRING(50),
				allowNull: false,
				unique: true
			},
			created_at: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
			}
		});

		// Índices estratégicos para post_status (1 índice)
		// idx_post_status_label (unique) - já criado pelo unique: true acima
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('post_status');
	}
};
