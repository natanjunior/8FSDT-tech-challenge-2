'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('posts', {
			id: {
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUIDV4,
				primaryKey: true,
				allowNull: false
			},
			title: {
				type: Sequelize.STRING(255),
				allowNull: false
			},
			content: {
				type: Sequelize.TEXT,
				allowNull: false
			},
			author_id: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: 'users',
					key: 'id'
				},
				onUpdate: 'CASCADE',
				onDelete: 'CASCADE'
			},
			discipline_id: {
				type: Sequelize.UUID,
				allowNull: true,
				references: {
					model: 'disciplines',
					key: 'id'
				},
				onUpdate: 'CASCADE',
				onDelete: 'RESTRICT'
			},
			status_id: {
				type: Sequelize.UUID,
				allowNull: true,
				references: {
					model: 'post_status',
					key: 'id'
				},
				onUpdate: 'CASCADE',
				onDelete: 'RESTRICT'
			},
			published_at: {
				type: Sequelize.DATE,
				allowNull: true
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

		// Índices estratégicos para posts (6 índices)

		// 1. idx_posts_author_id - Para buscar posts por autor
		await queryInterface.addIndex('posts', ['author_id'], {
			name: 'idx_posts_author_id',
			using: 'BTREE'
		});

		// 2. idx_posts_discipline_id - Para filtrar posts por disciplina
		await queryInterface.addIndex('posts', ['discipline_id'], {
			name: 'idx_posts_discipline_id',
			using: 'BTREE'
		});

		// 3. idx_posts_status_id - Para filtrar posts por status
		await queryInterface.addIndex('posts', ['status_id'], {
			name: 'idx_posts_status_id',
			using: 'BTREE'
		});

		// 4. idx_posts_created_at - Para ordenação por data de criação
		await queryInterface.sequelize.query(`
			CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
		`);

		// 5. idx_posts_published_at - Para filtrar posts publicados
		await queryInterface.sequelize.query(`
			CREATE INDEX idx_posts_published_at ON posts(published_at DESC NULLS LAST);
		`);

		// 6. idx_posts_title_search - GIN index para full-text search em português
		await queryInterface.sequelize.query(`
			CREATE INDEX idx_posts_title_search
			ON posts
			USING GIN (to_tsvector('portuguese', title || ' ' || content));
		`);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('posts');
	}
};
