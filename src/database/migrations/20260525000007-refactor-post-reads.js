'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeIndex('post_reads', 'idx_post_reads_unique').catch(() => {});
    await queryInterface.removeIndex('post_reads', 'idx_post_reads_user_id').catch(() => {});
    await queryInterface.removeConstraint('post_reads', 'post_reads_user_id_fkey').catch(() => {});

    await queryInterface.addColumn('post_reads', 'reader', {
      type: Sequelize.STRING(50),
      allowNull: true
    });

    // Sem dados — não há migração de valores.
    await queryInterface.removeColumn('post_reads', 'user_id');

    await queryInterface.changeColumn('post_reads', 'reader', {
      type: Sequelize.STRING(50),
      allowNull: false
    });

    await queryInterface.addIndex('post_reads', ['reader'], { name: 'idx_post_reads_reader' });
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX idx_post_reads_unique ON post_reads(post_id, reader);
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('post_reads', 'idx_post_reads_unique').catch(() => {});
    await queryInterface.removeIndex('post_reads', 'idx_post_reads_reader').catch(() => {});
    await queryInterface.removeColumn('post_reads', 'reader');

    await queryInterface.addColumn('post_reads', 'user_id', {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE'
    });
    await queryInterface.addIndex('post_reads', ['user_id'], { name: 'idx_post_reads_user_id' });
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX idx_post_reads_unique ON post_reads(post_id, user_id);
    `);
  },
};
