'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const teachers = [
      {
        id: 'Teacher/550e8400-e29b-41d4-a716-446655440001',
        name: 'Prof. João Silva',
        email: 'joao.silva@escola.com',
        pronouns: 'ele/dele',
        biography: 'Professor de Matemática e Ciências há 15 anos.',
        status: 'ATIVO',
        user_id: '111e8400-e29b-41d4-a716-446655440001'
      },
      {
        id: 'Teacher/550e8400-e29b-41d4-a716-446655440002',
        name: 'Profa. Maria Santos',
        email: 'maria.santos@escola.com',
        pronouns: 'ela/dela',
        biography: 'Professora de Português e História, apaixonada por literatura.',
        status: 'ATIVO',
        user_id: '111e8400-e29b-41d4-a716-446655440002'
      },
      {
        id: 'Teacher/550e8400-e29b-41d4-a716-446655440003',
        name: 'Prof. Carlos Mendes',
        email: 'carlos.mendes@escola.com',
        pronouns: 'ele/dele',
        biography: 'Geógrafo e historiador, gosta de aulas de campo.',
        status: 'ATIVO',
        user_id: '111e8400-e29b-41d4-a716-446655440003'
      },
      {
        id: 'Teacher/550e8400-e29b-41d4-a716-446655440004',
        name: 'Profa. Beatriz Rocha',
        email: 'beatriz.rocha@escola.com',
        pronouns: 'ela/dela',
        biography: 'Mestre em Ciências, adora experimentos em sala.',
        status: 'ATIVO',
        user_id: '111e8400-e29b-41d4-a716-446655440004'
      },
      {
        id: 'Teacher/550e8400-e29b-41d4-a716-446655440005',
        name: 'Prof. Anderson Luz',
        email: 'anderson.luz@escola.com',
        pronouns: 'ele/dele',
        biography: 'Professor de Português e Geografia.',
        status: 'ATIVO',
        user_id: '111e8400-e29b-41d4-a716-446655440005'
      },
      {
        // INATIVO — sem credencial (espelha o resultado do soft-delete)
        id: 'Teacher/550e8400-e29b-41d4-a716-446655440006',
        name: 'Prof. Rafael Antigo',
        email: 'rafael.antigo@escola.com',
        pronouns: 'ele/dele',
        biography: 'Professor aposentado (registro inativo).',
        status: 'INATIVO',
        user_id: null
      }
    ];

    await queryInterface.bulkInsert(
      'teachers',
      teachers.map((t) => ({ ...t, created_at: now, updated_at: now }))
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('teachers', null, {});
  }
};
