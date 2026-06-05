'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('teachers', [
      {
        id: 'Teacher/550e8400-e29b-41d4-a716-446655440001',
        name: 'Prof. João Silva',
        email: 'joao.silva@escola.com',
        pronouns: 'ele/dele',
        biography: 'Professor de Matemática e Ciências há 15 anos.',
        status: 'ATIVO',
        user_id: '111e8400-e29b-41d4-a716-446655440001',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'Teacher/550e8400-e29b-41d4-a716-446655440002',
        name: 'Profa. Maria Santos',
        email: 'maria.santos@escola.com',
        pronouns: 'ela/dela',
        biography: 'Professora de Português e História.',
        status: 'ATIVO',
        user_id: '111e8400-e29b-41d4-a716-446655440002',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('teachers', null, {});
  }
};
