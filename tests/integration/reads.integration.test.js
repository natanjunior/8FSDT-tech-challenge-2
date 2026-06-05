'use strict';

const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../../src/app');
const db = require('../../src/models');

// IDs conhecidos usados nos testes (criados no beforeAll)
const DISCIPLINE_ID = '660e8400-e29b-41d4-a716-446655440010';
const TEACHER_ID = 'Teacher/550e8400-e29b-41d4-a716-446655440010';
const POST_PUBLISHED_ID = '880e8400-e29b-41d4-a716-446655440010';

describe('Reads Integration Tests', () => {
  let teacherToken;
  let studentToken;
  let studentProfileId;

  beforeAll(async () => {
    await db.sequelize.sync({ force: true });

    const hash = await bcrypt.hash('senha123', 10);

    // Disciplina conhecida
    await db.Discipline.create({ id: DISCIPLINE_ID, label: 'Matemática' });

    // Usuário + perfil TEACHER (autor do post)
    const teacherUser = await db.User.create({
      login: 'joao.silva',
      password_hash: hash,
      role: 'TEACHER'
    });
    await db.Teacher.create({
      id: TEACHER_ID,
      name: 'João Silva',
      pronouns: 'ele/dele',
      status: 'ATIVO',
      user_id: teacherUser.id
    });

    // Usuário + perfil STUDENT (id auto-gerado: Student/<uuid>)
    const studentUser = await db.User.create({
      login: 'pedro.costa',
      password_hash: hash,
      role: 'STUDENT'
    });
    const student = await db.Student.create({
      name: 'Pedro Costa',
      status: 'ATIVO',
      user_id: studentUser.id
    });
    studentProfileId = student.id;

    // Post PUBLISHED autorado pelo teacher
    await db.Post.create({
      id: POST_PUBLISHED_ID,
      title: 'Post Publicado de Exemplo',
      content: 'Conteúdo do post publicado com mais de 10 caracteres',
      author: TEACHER_ID,
      discipline_id: DISCIPLINE_ID,
      status: 'PUBLISHED',
      published_at: new Date()
    });

    // Tokens via login + password
    const teacherLogin = await request(app)
      .post('/auth/login')
      .send({ login: 'joao.silva', password: 'senha123' });
    teacherToken = teacherLogin.body.token;

    const studentLogin = await request(app)
      .post('/auth/login')
      .send({ login: 'pedro.costa', password: 'senha123' });
    studentToken = studentLogin.body.token;
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  describe('POST /reads', () => {
    test('sem token retorna 401', async () => {
      const response = await request(app)
        .post('/reads')
        .send({ post_id: POST_PUBLISHED_ID });

      expect(response.status).toBe(401);
    });

    test('post_id inválido (não uuid) retorna 400', async () => {
      const response = await request(app)
        .post('/reads')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ post_id: 'nao-e-uuid' });

      expect(response.status).toBe(400);
    });

    test('sem post_id retorna 400', async () => {
      const response = await request(app)
        .post('/reads')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({});

      expect(response.status).toBe(400);
    });

    test('post inexistente (uuid válido) retorna 404', async () => {
      const response = await request(app)
        .post('/reads')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ post_id: '00000000-0000-0000-0000-000000000000' });

      expect(response.status).toBe(404);
    });

    test('primeira marcação retorna 201 com reader = profileId do chamador', async () => {
      const response = await request(app)
        .post('/reads')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ post_id: POST_PUBLISHED_ID });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('post_id', POST_PUBLISHED_ID);
      expect(response.body).toHaveProperty('reader', studentProfileId);
      expect(response.body.reader).toMatch(/^Student\//);
      expect(response.body).toHaveProperty('read_at');
      // campo legado não deve mais existir
      expect(response.body).not.toHaveProperty('user_id');
    });

    test('segunda marcação do mesmo post/usuário retorna 200 (idempotente) com mesmo read_at', async () => {
      const first = await request(app)
        .post('/reads')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ post_id: POST_PUBLISHED_ID });

      const second = await request(app)
        .post('/reads')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ post_id: POST_PUBLISHED_ID });

      expect(second.status).toBe(200);
      expect(second.body).toHaveProperty('reader', studentProfileId);
      expect(second.body.post_id).toBe(POST_PUBLISHED_ID);
      // idempotente: mesmo registro, mesmo read_at
      expect(second.body.read_at).toBe(first.body.read_at);
    });
  });

  describe('GET /reads/search', () => {
    test('sem token retorna 401', async () => {
      const response = await request(app).get('/reads/search');
      expect(response.status).toBe(401);
    });

    test('retorna as leituras do usuário autenticado com paginação', async () => {
      const response = await request(app)
        .get('/reads/search')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
      response.body.data.forEach((r) => {
        expect(r).toHaveProperty('reader', studentProfileId);
        expect(r).not.toHaveProperty('user_id');
      });
    });

    test('?post_id filtra por post específico', async () => {
      const response = await request(app)
        .get(`/reads/search?post_id=${POST_PUBLISHED_ID}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
      response.body.data.forEach((r) => {
        expect(r.post_id).toBe(POST_PUBLISHED_ID);
        expect(r.reader).toBe(studentProfileId);
      });
    });

    test('leituras são escopadas por usuário: leitura do STUDENT não aparece para o TEACHER', async () => {
      const response = await request(app)
        .get('/reads/search')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(response.status).toBe(200);
      // O teacher não marcou nada como lido — não deve ver a leitura do student
      expect(response.body.data.length).toBe(0);
      response.body.data.forEach((r) => {
        expect(r.reader).not.toBe(studentProfileId);
      });
    });

    test('escopo inverso: leitura do TEACHER não aparece para o STUDENT', async () => {
      // Teacher marca o post como lido
      const mark = await request(app)
        .post('/reads')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ post_id: POST_PUBLISHED_ID });

      expect([200, 201]).toContain(mark.status);
      expect(mark.body.reader).toBe(TEACHER_ID);

      // Busca do student não deve conter leituras do teacher
      const studentSearch = await request(app)
        .get('/reads/search')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(studentSearch.status).toBe(200);
      studentSearch.body.data.forEach((r) => {
        expect(r.reader).toBe(studentProfileId);
        expect(r.reader).not.toBe(TEACHER_ID);
      });
    });

    test('sort=-read_at retorna ordenado por read_at DESC', async () => {
      const response = await request(app)
        .get('/reads/search?sort=-read_at')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      const dates = response.body.data.map((r) => r.read_at);
      for (let i = 1; i < dates.length; i++) {
        expect(new Date(dates[i - 1]).getTime()).toBeGreaterThanOrEqual(
          new Date(dates[i]).getTime()
        );
      }
    });
  });
});
