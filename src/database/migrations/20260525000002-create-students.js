'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('students', {
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
      },
      course: {
        type: Sequelize.STRING(255),
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

    await queryInterface.addIndex('students', ['status'], {
      name: 'idx_students_status'
    });

    await queryInterface.addIndex('students', ['name'], {
      name: 'idx_students_name'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('students');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_students_pronouns";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_students_status";');
  }
};
