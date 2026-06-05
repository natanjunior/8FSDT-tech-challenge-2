'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('teacher_disciplines', [
      { teacher_id: 'Teacher/550e8400-e29b-41d4-a716-446655440001', discipline_id: '660e8400-e29b-41d4-a716-446655440001', created_at: new Date() },
      { teacher_id: 'Teacher/550e8400-e29b-41d4-a716-446655440001', discipline_id: '660e8400-e29b-41d4-a716-446655440003', created_at: new Date() },
      { teacher_id: 'Teacher/550e8400-e29b-41d4-a716-446655440002', discipline_id: '660e8400-e29b-41d4-a716-446655440002', created_at: new Date() },
      { teacher_id: 'Teacher/550e8400-e29b-41d4-a716-446655440002', discipline_id: '660e8400-e29b-41d4-a716-446655440004', created_at: new Date() }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('teacher_disciplines', null, {});
  }
};
