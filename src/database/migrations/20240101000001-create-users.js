'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('users', {
			id: {
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUIDV4,
				primaryKey: true,
				allowNull: false
			},
			name: {
				type: Sequelize.STRING(255),
				allowNull: false
			},
			email: {
				type: Sequelize.STRING(255),
				allowNull: false,
				unique: true
			},
			role: {
				type: Sequelize.ENUM('TEACHER', 'STUDENT'),
				allowNull: false,
				defaultValue: 'STUDENT'
			},
			created_at: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
			},
			updated_at: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
			}
		});

		// Índices estratégicos para users (3 índices)

		// 1. idx_users_email (unique) - já criado pelo unique: true acima

		// 2. idx_users_role - Para filtrar por TEACHER/STUDENT
		await queryInterface.addIndex('users', ['role'], {
			name: 'idx_users_role',
			using: 'BTREE'
		});

		// 3. idx_users_created_at - Para ordenação por data
		await queryInterface.sequelize.query(`
			CREATE INDEX idx_users_created_at ON users(created_at DESC);
		`);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('users');
	}
};
