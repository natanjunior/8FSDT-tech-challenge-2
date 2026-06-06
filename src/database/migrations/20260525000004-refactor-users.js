'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Adicionar novas colunas
    await queryInterface.addColumn('users', 'login', {
      type: Sequelize.STRING(100),
      allowNull: true, // temporário; vamos popular e depois NOT NULL
      unique: false
    });

    await queryInterface.addColumn('users', 'password_hash', {
      type: Sequelize.STRING(60),
      allowNull: true // idem
    });

    // Como não há dados reais em prod, populamos a partir do email só se houver linhas
    // (em dev/test isso é tudo limpo via undo + seed posterior; este passo é defensivo)
    await queryInterface.sequelize.query(`
      UPDATE users
      SET login = email,
          password_hash = '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
      WHERE login IS NULL;
    `);

    // Aplicar NOT NULL e UNIQUE
    await queryInterface.changeColumn('users', 'login', {
      type: Sequelize.STRING(100),
      allowNull: false
    });
    await queryInterface.changeColumn('users', 'password_hash', {
      type: Sequelize.STRING(60),
      allowNull: false
    });

    await queryInterface.addConstraint('users', {
      fields: ['login'],
      type: 'unique',
      name: 'users_login_unique'
    });

    // Remover constraint unique antiga de email e dropar colunas
    await queryInterface.removeConstraint('users', 'users_email_unique').catch(() => {});
    await queryInterface.removeColumn('users', 'email');
    await queryInterface.removeColumn('users', 'name');

    // Adicionar FKs para teachers.user_id e students.user_id agora que users tem novo schema
    await queryInterface.addConstraint('teachers', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'teachers_user_id_fkey',
      references: { table: 'users', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addConstraint('students', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'students_user_id_fkey',
      references: { table: 'users', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('students', 'students_user_id_fkey').catch(() => {});
    await queryInterface.removeConstraint('teachers', 'teachers_user_id_fkey').catch(() => {});

    await queryInterface.addColumn('users', 'name', {
      type: Sequelize.STRING(255),
      allowNull: true
    });
    await queryInterface.addColumn('users', 'email', {
      type: Sequelize.STRING(255),
      allowNull: true
    });

    await queryInterface.removeConstraint('users', 'users_login_unique').catch(() => {});
    await queryInterface.removeColumn('users', 'login');
    await queryInterface.removeColumn('users', 'password_hash');
  }
};
