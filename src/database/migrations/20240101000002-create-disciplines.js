'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('disciplines', {
			id: {
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUIDV4,
				primaryKey: true,
				allowNull: false
			},
			label: {
				type: Sequelize.STRING(100),
				allowNull: false,
				unique: true
			},
			created_at: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
			}
		});

		// Índices estratégicos para disciplines (1 índice)
		// idx_disciplines_label (unique) - já criado pelo unique: true acima
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('disciplines');
	}
};
