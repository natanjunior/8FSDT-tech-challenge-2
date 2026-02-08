'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('post_reads', {
			id: {
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUIDV4,
				primaryKey: true,
				allowNull: false
			},
			post_id: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: 'posts',
					key: 'id'
				},
				onUpdate: 'CASCADE',
				onDelete: 'CASCADE'
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
			read_at: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
			}
		});

		// Índices estratégicos para post_reads (3 índices)

		// 1. idx_post_reads_post_id - Para buscar leituras por post
		await queryInterface.addIndex('post_reads', ['post_id'], {
			name: 'idx_post_reads_post_id',
			using: 'BTREE'
		});

		// 2. idx_post_reads_user_id - Para buscar leituras por usuário
		await queryInterface.addIndex('post_reads', ['user_id'], {
			name: 'idx_post_reads_user_id',
			using: 'BTREE'
		});

		// 3. idx_post_reads_unique - Unique composite index (post_id, user_id)
		await queryInterface.sequelize.query(`
			CREATE UNIQUE INDEX idx_post_reads_unique ON post_reads(post_id, user_id);
		`);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('post_reads');
	}
};
