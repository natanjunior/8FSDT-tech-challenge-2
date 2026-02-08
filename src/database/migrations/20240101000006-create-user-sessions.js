'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('user_sessions', {
			id: {
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUIDV4,
				primaryKey: true,
				allowNull: false
			},
			user_id: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: 'users',
					key: 'id'
				},
				onUpdate: 'CASCADE',
				onDelete: 'CASCADE'
			},
			session_token: {
				type: Sequelize.STRING(500),
				allowNull: false,
				unique: true
			},
			expires_at: {
				type: Sequelize.DATE,
				allowNull: false
			},
			created_at: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
			}
		});

		// Índices estratégicos para user_sessions (2 índices)

		// 1. idx_user_sessions_user_id - Para buscar sessões por usuário
		await queryInterface.addIndex('user_sessions', ['user_id'], {
			name: 'idx_user_sessions_user_id',
			using: 'BTREE'
		});

		// 2. idx_user_sessions_expires_at - Para limpar sessões expiradas
		await queryInterface.addIndex('user_sessions', ['expires_at'], {
			name: 'idx_user_sessions_expires_at',
			using: 'BTREE'
		});

		// idx_user_sessions_token (unique) - já criado pelo unique: true acima
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('user_sessions');
	}
};
