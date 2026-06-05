'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('teacher_disciplines', {
      teacher_id: {
        type: Sequelize.STRING(50),
        allowNull: false,
        references: { model: 'teachers', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      discipline_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'disciplines', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addConstraint('teacher_disciplines', {
      fields: ['teacher_id', 'discipline_id'],
      type: 'primary key',
      name: 'teacher_disciplines_pkey'
    });

    await queryInterface.addIndex('teacher_disciplines', ['teacher_id'], {
      name: 'idx_teacher_disciplines_teacher_id'
    });
    await queryInterface.addIndex('teacher_disciplines', ['discipline_id'], {
      name: 'idx_teacher_disciplines_discipline_id'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('teacher_disciplines');
  }
};
