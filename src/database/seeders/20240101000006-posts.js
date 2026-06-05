'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('posts', [
      {
        id: '880e8400-e29b-41d4-a716-446655440001',
        title: 'Introdução à Álgebra Linear',
        content: '# Álgebra Linear\n\nÁlgebra Linear é fundamental para entender vetores, matrizes e sistemas lineares...',
        author: 'Teacher/550e8400-e29b-41d4-a716-446655440001',
        discipline_id: '660e8400-e29b-41d4-a716-446655440001',
        status: 'PUBLISHED',
        published_at: now,
        created_at: now,
        updated_at: now
      },
      {
        id: '880e8400-e29b-41d4-a716-446655440002',
        title: 'Funções Quadráticas — Aula 1',
        content: 'Uma função quadrática tem a forma f(x) = ax² + bx + c. Vamos explorar...',
        author: 'Teacher/550e8400-e29b-41d4-a716-446655440001',
        discipline_id: '660e8400-e29b-41d4-a716-446655440001',
        status: 'DRAFT',
        published_at: null,
        created_at: now,
        updated_at: now
      },
      {
        id: '880e8400-e29b-41d4-a716-446655440003',
        title: 'Crase e Acentuação',
        content: 'A crase é a fusão de duas vogais idênticas. Em português, marca-se com acento grave...',
        author: 'Teacher/550e8400-e29b-41d4-a716-446655440002',
        discipline_id: '660e8400-e29b-41d4-a716-446655440002',
        status: 'PUBLISHED',
        published_at: now,
        created_at: now,
        updated_at: now
      }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('posts', null, {});
  }
};
