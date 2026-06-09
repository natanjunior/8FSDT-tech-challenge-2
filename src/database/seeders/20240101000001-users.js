'use strict';

const bcrypt = require('bcrypt');

const PLAIN = 'senha123';

module.exports = {
  async up(queryInterface) {
    const hash = await bcrypt.hash(PLAIN, 10);
    const now = new Date();

    const users = [
      // Professores
      { id: '111e8400-e29b-41d4-a716-446655440001', login: 'joao.silva', role: 'TEACHER' },
      { id: '111e8400-e29b-41d4-a716-446655440002', login: 'maria.santos', role: 'TEACHER' },
      { id: '111e8400-e29b-41d4-a716-446655440003', login: 'carlos.mendes', role: 'TEACHER' },
      { id: '111e8400-e29b-41d4-a716-446655440004', login: 'beatriz.rocha', role: 'TEACHER' },
      { id: '111e8400-e29b-41d4-a716-446655440005', login: 'anderson.luz', role: 'TEACHER' },
      // Alunos
      { id: '111e8400-e29b-41d4-a716-446655440006', login: 'pedro.costa', role: 'STUDENT' },
      { id: '111e8400-e29b-41d4-a716-446655440007', login: 'ana.oliveira', role: 'STUDENT' },
      { id: '111e8400-e29b-41d4-a716-446655440008', login: 'lucas.martins', role: 'STUDENT' },
      { id: '111e8400-e29b-41d4-a716-446655440009', login: 'juliana.dias', role: 'STUDENT' },
      { id: '111e8400-e29b-41d4-a716-446655440010', login: 'marcos.vinicius', role: 'STUDENT' }
    ];

    await queryInterface.bulkInsert(
      'users',
      users.map((u) => ({
        id: u.id,
        login: u.login,
        password_hash: hash,
        role: u.role,
        created_at: now,
        updated_at: now
      }))
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
