'use strict';

/**
 * Migration: Replace status_id (UUID FK) with status (ENUM)
 *
 * This migration:
 * 1. Adds a new 'status' ENUM column to posts table
 * 2. Migrates data from post_status.label to posts.status
 * 3. Removes the status_id foreign key column
 * 4. Drops the post_status table
 *
 * v11 → v12: Simplifies architecture by removing lookup table
 */

module.exports = {
	async up(queryInterface, Sequelize) {
		// Step 1: Add new 'status' ENUM column (nullable initially)
		await queryInterface.addColumn('posts', 'status', {
			type: Sequelize.ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED'),
			allowNull: true,
			defaultValue: 'DRAFT'
		});

		// Step 2: Migrate existing data (UUID → ENUM string)
		// Copy label from post_status table to the new status column
		// Cast explicitly to enum_posts_status type
		await queryInterface.sequelize.query(`
			UPDATE posts
			SET status = post_status.label::enum_posts_status
			FROM post_status
			WHERE posts.status_id = post_status.id;
		`);

		// Step 3: Set default for any posts without status
		await queryInterface.sequelize.query(`
			UPDATE posts
			SET status = 'DRAFT'
			WHERE status IS NULL;
		`);

		// Step 4: Make status column non-nullable
		await queryInterface.changeColumn('posts', 'status', {
			type: Sequelize.ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED'),
			allowNull: false,
			defaultValue: 'DRAFT'
		});

		// Step 5: Drop the foreign key constraint
		await queryInterface.removeConstraint('posts', 'posts_status_id_fkey');

		// Step 6: Remove the old status_id column
		await queryInterface.removeColumn('posts', 'status_id');

		// Step 7: Drop the old index
		await queryInterface.removeIndex('posts', 'idx_posts_status_id');

		// Step 8: Create new index on status column
		await queryInterface.addIndex('posts', ['status'], {
			name: 'idx_posts_status',
			using: 'BTREE'
		});

		// Step 9: Drop the post_status table
		await queryInterface.dropTable('post_status');
	},

	async down(queryInterface, Sequelize) {
		// Recreate post_status table
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
				unique: true,
				validate: {
					isIn: [['DRAFT', 'PUBLISHED', 'ARCHIVED']]
				}
			},
			created_at: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
			}
		});

		// Re-insert status records with original UUIDs
		await queryInterface.bulkInsert('post_status', [
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
		]);

		// Add status_id column back
		await queryInterface.addColumn('posts', 'status_id', {
			type: Sequelize.UUID,
			allowNull: true
		});

		// Migrate data back (ENUM → UUID)
		// Cast ENUM to text for comparison
		await queryInterface.sequelize.query(`
			UPDATE posts
			SET status_id = post_status.id
			FROM post_status
			WHERE posts.status::text = post_status.label;
		`);

		// Make status_id non-nullable
		await queryInterface.changeColumn('posts', 'status_id', {
			type: Sequelize.UUID,
			allowNull: false
		});

		// Add foreign key constraint back
		await queryInterface.addConstraint('posts', {
			fields: ['status_id'],
			type: 'foreign key',
			name: 'posts_status_id_fkey',
			references: {
				table: 'post_status',
				field: 'id'
			},
			onUpdate: 'CASCADE',
			onDelete: 'RESTRICT'
		});

		// Recreate index
		await queryInterface.addIndex('posts', ['status_id'], {
			name: 'idx_posts_status_id',
			using: 'BTREE'
		});

		// Drop new status column and index
		await queryInterface.removeIndex('posts', 'idx_posts_status');
		await queryInterface.removeColumn('posts', 'status');

		// Drop ENUM type
		await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_posts_status";');
	}
};
