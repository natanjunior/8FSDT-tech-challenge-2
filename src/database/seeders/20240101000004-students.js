'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('students', [
      {
        id: 'Student/550e8400-e29b-41d4-a716-446655440003',
        name: 'Pedro Costa',
        email: 'pedro.costa@aluno.com',
        pronouns: 'ele/dele',
        status: 'ATIVO',
        user_id: '111e8400-e29b-41d4-a716-446655440003',
        course: 'Ensino Médio - 2º Ano',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'Student/550e8400-e29b-41d4-a716-446655440004',
        name: 'Ana Oliveira',
        email: 'ana.oliveira@aluno.com',
        pronouns: 'ela/dela',
        status: 'ATIVO',
        user_id: '111e8400-e29b-41d4-a716-446655440004',
        course: 'Ensino Médio - 3º Ano',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('students', null, {});
  }
};
