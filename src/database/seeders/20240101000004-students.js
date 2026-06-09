'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const students = [
      {
        id: 'Student/550e8400-e29b-41d4-a716-446655440001',
        name: 'Pedro Costa',
        email: 'pedro.costa@aluno.com',
        pronouns: 'ele/dele',
        biography: 'Curioso por exatas.',
        status: 'ATIVO',
        course: 'Ensino Médio - 2º Ano',
        user_id: '111e8400-e29b-41d4-a716-446655440006'
      },
      {
        id: 'Student/550e8400-e29b-41d4-a716-446655440002',
        name: 'Ana Oliveira',
        email: 'ana.oliveira@aluno.com',
        pronouns: 'ela/dela',
        biography: 'Gosta de redação e história.',
        status: 'ATIVO',
        course: 'Ensino Médio - 3º Ano',
        user_id: '111e8400-e29b-41d4-a716-446655440007'
      },
      {
        id: 'Student/550e8400-e29b-41d4-a716-446655440003',
        name: 'Lucas Martins',
        email: 'lucas.martins@aluno.com',
        pronouns: 'ele/dele',
        biography: null,
        status: 'ATIVO',
        course: 'Ensino Médio - 1º Ano',
        user_id: '111e8400-e29b-41d4-a716-446655440008'
      },
      {
        id: 'Student/550e8400-e29b-41d4-a716-446655440004',
        name: 'Juliana Dias',
        email: 'juliana.dias@aluno.com',
        pronouns: 'ela/dela',
        biography: 'Representante de turma.',
        status: 'ATIVO',
        course: 'Ensino Médio - 2º Ano',
        user_id: '111e8400-e29b-41d4-a716-446655440009'
      },
      {
        id: 'Student/550e8400-e29b-41d4-a716-446655440005',
        name: 'Marcos Vinícius',
        email: 'marcos.vinicius@aluno.com',
        pronouns: 'ele/dele',
        biography: null,
        status: 'ATIVO',
        course: 'Ensino Médio - 3º Ano',
        user_id: '111e8400-e29b-41d4-a716-446655440010'
      },
      {
        // INATIVO — sem credencial
        id: 'Student/550e8400-e29b-41d4-a716-446655440006',
        name: 'Fernanda Egressa',
        email: 'fernanda.egressa@aluno.com',
        pronouns: 'ela/dela',
        biography: 'Aluna concluinte (registro inativo).',
        status: 'INATIVO',
        course: 'Ensino Médio - 3º Ano',
        user_id: null
      }
    ];

    await queryInterface.bulkInsert(
      'students',
      students.map((s) => ({ ...s, created_at: now, updated_at: now }))
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('students', null, {});
  }
};
