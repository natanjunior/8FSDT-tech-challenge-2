'use strict';

const { v4: uuidv4 } = require('uuid');
const { QueryTypes } = require('sequelize');

const HOUR_MS = 60 * 60 * 1000;

// quantidade de leitores conforme recência (rank 0 = mais novo)
function readerCountForRank(rank) {
  if (rank < 10) return 4 + (rank % 3);   // 4..6
  if (rank < 20) return 1 + (rank % 3);   // 1..3
  return rank % 2;                         // 0..1
}

module.exports = {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize;

    const posts = await sequelize.query(
      'SELECT id, created_at FROM posts ORDER BY created_at DESC',
      { type: QueryTypes.SELECT }
    );
    const teachers = await sequelize.query(
      "SELECT id FROM teachers WHERE status = 'ATIVO' ORDER BY id",
      { type: QueryTypes.SELECT }
    );
    const students = await sequelize.query(
      "SELECT id FROM students WHERE status = 'ATIVO' ORDER BY id",
      { type: QueryTypes.SELECT }
    );

    // Pool de leitores (alunos primeiro, depois professores)
    const readerPool = [...students.map((s) => s.id), ...teachers.map((t) => t.id)];

    const rows = [];
    let rotation = 0; // desloca o ponto de partida do pool por post (varia os leitores)

    posts.forEach((post, rank) => {
      const count = Math.min(readerCountForRank(rank), readerPool.length);
      const created = new Date(post.created_at).getTime();
      const seen = new Set(); // garante reader distinto dentro do mesmo post
      for (let k = 0; k < count; k++) {
        const reader = readerPool[(rotation + k) % readerPool.length];
        if (seen.has(reader)) continue;
        seen.add(reader);
        rows.push({
          id: uuidv4(),
          post_id: post.id,
          reader,
          read_at: new Date(created + (k + 1) * HOUR_MS)
        });
      }
      rotation++;
    });

    if (rows.length > 0) {
      await queryInterface.bulkInsert('post_reads', rows);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('post_reads', null, {});
  }
};
