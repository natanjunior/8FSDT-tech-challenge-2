'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('comments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      post_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'posts', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      anonymous_id: {
        type: Sequelize.UUID,
        allowNull: true
      },
      author_name: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
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

    await queryInterface.addIndex('comments', ['post_id'], {
      name: 'idx_comments_post_id',
      using: 'BTREE'
    });

    await queryInterface.addIndex('comments', ['user_id'], {
      name: 'idx_comments_user_id',
      using: 'BTREE'
    });

    await queryInterface.addIndex('comments', ['anonymous_id'], {
      name: 'idx_comments_anonymous_id',
      using: 'BTREE'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('comments');
  }
};
