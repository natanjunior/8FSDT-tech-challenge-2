'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('teachers', {
      id: {
        type: Sequelize.STRING(50),
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      birth_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      pronouns: {
        type: Sequelize.ENUM('ele/dele', 'ela/dela', 'elu/delu', 'outro'),
        allowNull: true
      },
      biography: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('ATIVO', 'INATIVO'),
        allowNull: false,
        defaultValue: 'ATIVO'
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        unique: true
        // FK adicionada na migration de refactor-users (após users existir com novo schema)
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

    await queryInterface.addIndex('teachers', ['status'], {
      name: 'idx_teachers_status',
      using: 'BTREE'
    });

    await queryInterface.addIndex('teachers', ['name'], {
      name: 'idx_teachers_name',
      using: 'BTREE'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('teachers');
    // Drop dos ENUMs criados implicitamente pelo Sequelize em PG
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_teachers_pronouns";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_teachers_status";');
  }
};
