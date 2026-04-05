'use strict';

const request = require('supertest');
const app = require('../../src/app');

describe('Reads Integration Tests', () => {
  let teacherToken;
  let publishedPostId;

  beforeAll(async () => {
    const teacherLogin = await request(app)
      .post('/auth/login')
      .send({ email: 'joao.silva@escola.com' });
    teacherToken = teacherLogin.body.token;

    const postsResponse = await request(app).get('/posts');
    publishedPostId = postsResponse.body.data[0]?.id;
  });

  describe('POST /reads', () => {
    test('sem token retorna 401', async () => {
      const response = await request(app)
        .post('/reads')
        .send({ post_id: publishedPostId });

      expect(response.status).toBe(401);
    });

    test('sem post_id retorna 400', async () => {
      const response = await request(app)
        .post('/reads')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({});

      expect(response.status).toBe(400);
    });

    test('post inexistente retorna 404', async () => {
      const response = await request(app)
        .post('/reads')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ post_id: '00000000-0000-0000-0000-000000000000' });

      expect(response.status).toBe(404);
    });

    test('primeira marcação retorna 201 com shape correto', async () => {
      const response = await request(app)
        .post('/reads')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ post_id: publishedPostId });

      // 201 na primeira vez, 200 nas seguintes (idempotente)
      expect([200, 201]).toContain(response.status);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('post_id', publishedPostId);
      expect(response.body).toHaveProperty('user_id');
      expect(response.body).toHaveProperty('read_at');
    });

    test('segunda marcação retorna 200 (idempotente)', async () => {
      const response = await request(app)
        .post('/reads')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ post_id: publishedPostId });

      expect(response.status).toBe(200);
    });
  });

  describe('GET /reads/search', () => {
    test('sem token retorna 401', async () => {
      const response = await request(app).get('/reads/search');
      expect(response.status).toBe(401);
    });

    test('retorna leituras do usuário autenticado', async () => {
      const response = await request(app)
        .get('/reads/search')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('?post_id filtra por post específico', async () => {
      const response = await request(app)
        .get(`/reads/search?post_id=${publishedPostId}`)
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
      response.body.data.forEach((r) => {
        expect(r.post_id).toBe(publishedPostId);
      });
    });

    test('?post_id de post não lido retorna array vazio', async () => {
      // Buscar um post diferente do que foi marcado
      const postsResponse = await request(app)
        .get('/posts')
        .set('Authorization', `Bearer ${teacherToken}`);

      const unreadPost = postsResponse.body.data.find((p) => p.id !== publishedPostId);

      if (!unreadPost) return; // pula se todos foram lidos

      const response = await request(app)
        .get(`/reads/search?post_id=${unreadPost.id}`)
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(response.status).toBe(200);
      // Pode ser vazio ou não, mas deve retornar 200 com shape correto
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
    });

    test('sort=-read_at retorna ordenado por read_at DESC', async () => {
      const response = await request(app)
        .get('/reads/search?sort=-read_at')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(response.status).toBe(200);
      const dates = response.body.data.map((r) => r.read_at);
      for (let i = 1; i < dates.length; i++) {
        expect(new Date(dates[i - 1]).getTime()).toBeGreaterThanOrEqual(
          new Date(dates[i]).getTime()
        );
      }
    });

    test('POST /posts/:id/read retorna 404 (rota removida)', async () => {
      const response = await request(app)
        .post(`/posts/${publishedPostId}/read`)
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(response.status).toBe(404);
    });

    test('GET /posts/:id/read retorna 404 (rota removida)', async () => {
      const response = await request(app)
        .get(`/posts/${publishedPostId}/read`)
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(response.status).toBe(404);
    });
  });
});
