'use strict';

// Disciplinas (IDs fixos do seeder 0002)
const DISC = {
  MAT: '660e8400-e29b-41d4-a716-446655440001',
  POR: '660e8400-e29b-41d4-a716-446655440002',
  CIE: '660e8400-e29b-41d4-a716-446655440003',
  HIS: '660e8400-e29b-41d4-a716-446655440004',
  GEO: '660e8400-e29b-41d4-a716-446655440005'
};

// Professores ATIVO por disciplina (round-robin entre quem leciona)
const TEACHERS_BY_DISC = {
  [DISC.MAT]: ['Teacher/550e8400-e29b-41d4-a716-446655440001', 'Teacher/550e8400-e29b-41d4-a716-446655440004'],
  [DISC.POR]: ['Teacher/550e8400-e29b-41d4-a716-446655440002', 'Teacher/550e8400-e29b-41d4-a716-446655440005'],
  [DISC.CIE]: ['Teacher/550e8400-e29b-41d4-a716-446655440001', 'Teacher/550e8400-e29b-41d4-a716-446655440004'],
  [DISC.HIS]: ['Teacher/550e8400-e29b-41d4-a716-446655440002', 'Teacher/550e8400-e29b-41d4-a716-446655440003'],
  [DISC.GEO]: ['Teacher/550e8400-e29b-41d4-a716-446655440003', 'Teacher/550e8400-e29b-41d4-a716-446655440005']
};

// 6 temas por disciplina
const THEMES = {
  [DISC.MAT]: [
    'Introdução às Funções', 'Equações do 2º Grau', 'Trigonometria no Triângulo',
    'Progressões Aritméticas', 'Geometria Analítica', 'Probabilidade Básica'
  ],
  [DISC.POR]: [
    'Figuras de Linguagem', 'Análise Sintática', 'Gêneros Textuais',
    'Crase sem Mistério', 'Coesão e Coerência', 'Interpretação de Texto'
  ],
  [DISC.CIE]: [
    'Células e Tecidos', 'O Sistema Solar', 'Cadeias Alimentares',
    'Estados Físicos da Matéria', 'Energia e Trabalho', 'Genética Mendeliana'
  ],
  [DISC.HIS]: [
    'Brasil Colônia', 'Revolução Industrial', 'Era Vargas',
    'Guerra Fria', 'Idade Média', 'Independência do Brasil'
  ],
  [DISC.GEO]: [
    'Clima e Vegetação', 'Urbanização no Brasil', 'Placas Tectônicas',
    'Globalização', 'Recursos Hídricos', 'Cartografia Básica'
  ]
};

const DAY_MS = 24 * 60 * 60 * 1000;
const pad2 = (n) => String(n).padStart(2, '0');

function buildContent(title, disciplineName) {
  return [
    `# ${title}`,
    '',
    `Material de apoio da disciplina de **${disciplineName}**.`,
    '',
    'Nesta aula vamos abordar os principais conceitos e ver exemplos práticos.',
    '',
    '## Tópicos',
    '- Conceito e definição',
    '- Exemplos resolvidos',
    '- Exercícios propostos',
    '',
    '> Dica: revise os exemplos antes de tentar os exercícios.'
  ].join('\n');
}

const DISC_NAMES = {
  [DISC.MAT]: 'Matemática',
  [DISC.POR]: 'Português',
  [DISC.CIE]: 'Ciências',
  [DISC.HIS]: 'História',
  [DISC.GEO]: 'Geografia'
};

module.exports = {
  async up(queryInterface) {
    const base = new Date();
    const rows = [];

    // 1) 30 posts: para cada disciplina, 6 temas
    let seq = 0; // ordem global de criação (0 = mais antigo)
    const disciplineIds = Object.keys(THEMES);
    // intercalar por disciplina para distribuir as datas entre matérias
    for (let t = 0; t < 6; t++) {
      for (let d = 0; d < disciplineIds.length; d++) {
        const discId = disciplineIds[d];
        const title = THEMES[discId][t];
        const authors = TEACHERS_BY_DISC[discId];
        const author = authors[seq % authors.length];
        rows.push({ discId, title, author });
        seq++;
      }
    }
    // rows agora tem 30 itens, em ordem de "criação" (índice 0 = mais antigo)

    const total = rows.length; // 30
    // Marcar os 2 mais novos como DRAFT (índices total-1 e total-2)
    const draftIdx = new Set([total - 1, total - 2]);

    const records = rows.map((r, i) => {
      const isDraft = draftIdx.has(i);
      const createdAt = new Date(base.getTime() - (total - 1 - i) * DAY_MS);
      return {
        id: `880e8400-e29b-41d4-a716-4466554400${pad2(i + 1)}`,
        title: r.title,
        content: buildContent(r.title, DISC_NAMES[r.discId]),
        author: r.author,
        discipline_id: r.discId,
        status: isDraft ? 'DRAFT' : 'PUBLISHED',
        published_at: isDraft ? null : createdAt,
        created_at: createdAt,
        updated_at: createdAt
      };
    });

    // 2) 1 post ARCHIVED extra (mais antigo que todos), disciplina História
    const archivedCreated = new Date(base.getTime() - (total + 1) * DAY_MS);
    records.push({
      id: '880e8400-e29b-41d4-a716-446655440031',
      title: 'Conteúdo Arquivado — Revisão Antiga',
      content: buildContent('Conteúdo Arquivado — Revisão Antiga', 'História'),
      author: 'Teacher/550e8400-e29b-41d4-a716-446655440002',
      discipline_id: DISC.HIS,
      status: 'ARCHIVED',
      published_at: archivedCreated,
      created_at: archivedCreated,
      updated_at: archivedCreated
    });

    await queryInterface.bulkInsert('posts', records);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('posts', null, {});
  }
};
