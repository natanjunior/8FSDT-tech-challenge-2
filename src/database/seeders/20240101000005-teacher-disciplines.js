'use strict';

const T = (n) => `Teacher/550e8400-e29b-41d4-a716-4466554400${n}`;
const D = (n) => `660e8400-e29b-41d4-a716-4466554400${n}`;

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const pairs = [
      [T('01'), D('01')], [T('01'), D('03')],
      [T('02'), D('02')], [T('02'), D('04')],
      [T('03'), D('05')], [T('03'), D('04')],
      [T('04'), D('03')], [T('04'), D('01')],
      [T('05'), D('02')], [T('05'), D('05')],
      [T('06'), D('01')]
    ];

    await queryInterface.bulkInsert(
      'teacher_disciplines',
      pairs.map(([teacher_id, discipline_id]) => ({
        teacher_id,
        discipline_id,
        created_at: now
      }))
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('teacher_disciplines', null, {});
  }
};
