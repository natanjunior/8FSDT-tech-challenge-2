'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeIndex('comments', 'idx_comments_user_id').catch(() => {});
    await queryInterface.removeIndex('comments', 'idx_comments_anonymous_id').catch(() => {});

    await queryInterface.removeColumn('comments', 'user_id');
    await queryInterface.removeColumn('comments', 'anonymous_id');
    await queryInterface.removeColumn('comments', 'author_name');

    await queryInterface.addColumn('comments', 'author', {
      type: Sequelize.STRING(50),
      allowNull: false,
      defaultValue: 'Teacher/00000000-0000-0000-0000-000000000000' // placeholder; sem dados em prod
    });
    // Remover default depois (semântica de NOT NULL preserva-se)
    await queryInterface.changeColumn('comments', 'author', {
      type: Sequelize.STRING(50),
      allowNull: false
    });

    await queryInterface.addIndex('comments', ['author'], { name: 'idx_comments_author' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('comments', 'idx_comments_author').catch(() => {});
    await queryInterface.removeColumn('comments', 'author');

    await queryInterface.addColumn('comments', 'user_id', {
      type: Sequelize.UUID,
      allowNull: true
    });
    await queryInterface.addColumn('comments', 'anonymous_id', {
      type: Sequelize.UUID,
      allowNull: true
    });
    await queryInterface.addColumn('comments', 'author_name', {
      type: Sequelize.STRING(100),
      allowNull: true
    });

    await queryInterface.addIndex('comments', ['user_id'], { name: 'idx_comments_user_id' });
    await queryInterface.addIndex('comments', ['anonymous_id'], { name: 'idx_comments_anonymous_id' });
  }
};
