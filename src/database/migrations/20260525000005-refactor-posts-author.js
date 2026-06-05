'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Remover FK antiga de author_id → users
    await queryInterface.removeConstraint('posts', 'posts_author_id_fkey').catch(() => {});

    // 2. Adicionar coluna author (string) temporariamente nullable
    await queryInterface.addColumn('posts', 'author', {
      type: Sequelize.STRING(50),
      allowNull: true
    });

    // 3. Não há dados a migrar (db foi limpo no início). Em produção, idem.

    // 4. Remover coluna author_id
    await queryInterface.removeColumn('posts', 'author_id');

    // 5. author NOT NULL
    await queryInterface.changeColumn('posts', 'author', {
      type: Sequelize.STRING(50),
      allowNull: false
    });

    // 6. FK author → teachers.id ON DELETE RESTRICT
    await queryInterface.addConstraint('posts', {
      fields: ['author'],
      type: 'foreign key',
      name: 'posts_author_fkey',
      references: { table: 'teachers', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });

    // 7. Renomear índice antigo
    await queryInterface.removeIndex('posts', 'idx_posts_author_id').catch(() => {});
    await queryInterface.addIndex('posts', ['author'], { name: 'idx_posts_author' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('posts', 'idx_posts_author').catch(() => {});
    await queryInterface.removeConstraint('posts', 'posts_author_fkey').catch(() => {});

    await queryInterface.addColumn('posts', 'author_id', {
      type: Sequelize.UUID,
      allowNull: true
    });
    await queryInterface.removeColumn('posts', 'author');
    await queryInterface.addIndex('posts', ['author_id'], { name: 'idx_posts_author_id' });
  }
};
