'use strict';

const bcrypt = require('bcrypt');

const PLAIN = 'senha123';

module.exports = {
  async up(queryInterface) {
    const hash = await bcrypt.hash(PLAIN, 10);
    await queryInterface.bulkInsert('users', [
      { id: '111e8400-e29b-41d4-a716-446655440001', login: 'joao.silva',   password_hash: hash, role: 'TEACHER', created_at: new Date(), updated_at: new Date() },
      { id: '111e8400-e29b-41d4-a716-446655440002', login: 'maria.santos', password_hash: hash, role: 'TEACHER', created_at: new Date(), updated_at: new Date() },
      { id: '111e8400-e29b-41d4-a716-446655440003', login: 'pedro.costa',  password_hash: hash, role: 'STUDENT', created_at: new Date(), updated_at: new Date() },
      { id: '111e8400-e29b-41d4-a716-446655440004', login: 'ana.oliveira', password_hash: hash, role: 'STUDENT', created_at: new Date(), updated_at: new Date() }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
