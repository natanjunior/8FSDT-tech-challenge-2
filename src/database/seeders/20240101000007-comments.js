'use strict';

const { v4: uuidv4 } = require('uuid');
const { QueryTypes } = require('sequelize');

const HOUR_MS = 60 * 60 * 1000;

const PHRASES = [
  'Excelente explicação, professor!',
  'Gostei muito desse conteúdo.',
  'Tenho uma dúvida sobre o segundo tópico.',
  'Os exemplos ajudaram bastante.',
  'Poderia indicar exercícios extras?',
  'Muito claro e direto, obrigado!',
  'Achei a parte final um pouco difícil.',
  'Vou revisar isso para a prova.',
  'Esse assunto caiu no último simulado.',
  'Adorei a dica do final!',
  'Faltou um exemplo prático no tópico 1.',
  'Conteúdo muito bem organizado.',
  'Consegui entender depois de reler.',
  'Top demais, ajudou muito.',
  'Quando sai a próxima aula sobre isso?'
];

// quantidade de comentários conforme a "recência" (rank: 0 = mais novo)
function commentCountForRank(rank, totalPublishedLike) {
  if (rank < 10) return 3 + (rank % 4);   // 3..6 nos 10 mais novos
  if (rank < 20) return rank % 3;          // 0..2 nos intermediários
  return rank % 2;                         // 0..1 nos antigos
}

module.exports = {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize;

    // Posts ordenados do mais novo para o mais antigo (rank 0 = mais novo)
    const posts = await sequelize.query(
      'SELECT id, created_at FROM posts ORDER BY created_at DESC',
      { type: QueryTypes.SELECT }
    );

    // Perfis ativos para autoria (mix de alunos e professores)
    const teachers = await sequelize.query(
      "SELECT id FROM teachers WHERE status = 'ATIVO' ORDER BY id",
      { type: QueryTypes.SELECT }
    );
    const students = await sequelize.query(
      "SELECT id FROM students WHERE status = 'ATIVO' ORDER BY id",
      { type: QueryTypes.SELECT }
    );

    // Pool de autores intercalando aluno/professor
    const authorPool = [];
    const maxLen = Math.max(teachers.length, students.length);
    for (let i = 0; i < maxLen; i++) {
      if (students[i]) authorPool.push(students[i].id);
      if (teachers[i]) authorPool.push(teachers[i].id);
    }

    const rows = [];
    let authorCursor = 0;
    let phraseCursor = 0;

    posts.forEach((post, rank) => {
      const count = commentCountForRank(rank);
      const created = new Date(post.created_at).getTime();
      for (let k = 0; k < count; k++) {
        rows.push({
          id: uuidv4(),
          post_id: post.id,
          author: authorPool[authorCursor % authorPool.length],
          content: PHRASES[phraseCursor % PHRASES.length],
          created_at: new Date(created + (k + 1) * HOUR_MS),
          updated_at: new Date(created + (k + 1) * HOUR_MS)
        });
        authorCursor++;
        phraseCursor++;
      }
    });

    if (rows.length > 0) {
      await queryInterface.bulkInsert('comments', rows);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('comments', null, {});
  }
};
