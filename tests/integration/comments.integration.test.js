'use strict';

const request = require('supertest');
const app = require('../../src/app');

describe('Comments Integration Tests', () => {
  let teacherToken;
  let studentToken;
  const anonId = '11111111-1111-1111-1111-111111111111';
  const anotherAnonId = '22222222-2222-2222-2222-222222222222';
  let publishedPostId;
  let createdCommentId;
  let anonCommentId;

  beforeAll(async () => {
    const teacherLogin = await request(app)
      .post('/auth/login')
      .send({ email: 'joao.silva@escola.com' });
    teacherToken = teacherLogin.body.token;

    const studentLogin = await request(app)
      .post('/auth/login')
      .send({ email: 'pedro.costa@aluno.com' });
    studentToken = studentLogin.body.token;

    // Pegar um post publicado para usar nos testes
    const postsResponse = await request(app).get('/posts');
    publishedPostId = postsResponse.body.data[0]?.id;
  });

  describe('POST /comments', () => {
    test('sem post_id retorna 400', async () => {
      const response = await request(app)
        .post('/comments')
        .send({ content: 'Conteúdo válido' });

      expect(response.status).toBe(400);
    });

    test('content vazio retorna 400', async () => {
      const response = await request(app)
        .post('/comments')
        .send({ post_id: publishedPostId, content: '' });

      expect(response.status).toBe(400);
    });

    test('post inexistente retorna 404', async () => {
      const response = await request(app)
        .post('/comments')
        .set('x-anonymous-id', anonId)
        .send({
          post_id: '00000000-0000-0000-0000-000000000000',
          content: 'Comentário teste'
        });

      expect(response.status).toBe(404);
    });

    test('comentário autenticado retorna 201 com is_anonymous false', async () => {
      const response = await request(app)
        .post('/comments')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ post_id: publishedPostId, content: 'Comentário autenticado' });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.is_anonymous).toBe(false);
      expect(response.body.can_delete).toBe(true);
      createdCommentId = response.body.id;
    });

    test('comentário anônimo com X-Anonymous-Id retorna 201 com is_anonymous true', async () => {
      const response = await request(app)
        .post('/comments')
        .set('x-anonymous-id', anonId)
        .send({
          post_id: publishedPostId,
          content: 'Comentário anônimo',
          author_name: 'Visitante'
        });

      expect(response.status).toBe(201);
      expect(response.body.is_anonymous).toBe(true);
      expect(response.body.author_name).toBe('Visitante');
      expect(response.body.can_delete).toBe(true);
      anonCommentId = response.body.id;
    });
  });

  describe('GET /comments/search', () => {
    test('retorna comentários do post com paginação', async () => {
      const response = await request(app).get(
        `/comments/search?post_id=${publishedPostId}`
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('sem post_id retorna todos os comentários', async () => {
      const response = await request(app)
        .get('/comments/search')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(response.status).toBe(200);
      expect(response.body.pagination.total).toBeGreaterThanOrEqual(2);
    });

    test('comentário anônimo tem can_delete true com X-Anonymous-Id correto', async () => {
      const response = await request(app)
        .get(`/comments/search?post_id=${publishedPostId}`)
        .set('x-anonymous-id', anonId);

      const anonComment = response.body.data.find((c) => c.id === anonCommentId);
      expect(anonComment).toBeDefined();
      expect(anonComment.can_delete).toBe(true);
    });

    test('comentário anônimo tem can_delete false com X-Anonymous-Id diferente', async () => {
      const response = await request(app)
        .get(`/comments/search?post_id=${publishedPostId}`)
        .set('x-anonymous-id', anotherAnonId);

      const anonComment = response.body.data.find((c) => c.id === anonCommentId);
      expect(anonComment).toBeDefined();
      expect(anonComment.can_delete).toBe(false);
    });

    test('post_id inválido retorna 400', async () => {
      const response = await request(app).get('/comments/search?post_id=nao-uuid');
      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /comments/:id', () => {
    test('dono autenticado pode deletar seu comentário', async () => {
      const response = await request(app)
        .delete(`/comments/${createdCommentId}`)
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(response.status).toBe(204);
    });

    test('anônimo com X-Anonymous-Id correto pode deletar', async () => {
      const response = await request(app)
        .delete(`/comments/${anonCommentId}`)
        .set('x-anonymous-id', anonId);

      expect(response.status).toBe(204);
    });

    test('anônimo com X-Anonymous-Id errado retorna 403', async () => {
      // Criar novo comentário anônimo para este teste
      const createResponse = await request(app)
        .post('/comments')
        .set('x-anonymous-id', anonId)
        .send({ post_id: publishedPostId, content: 'Para deletar com erro' });

      const newCommentId = createResponse.body.id;

      const response = await request(app)
        .delete(`/comments/${newCommentId}`)
        .set('x-anonymous-id', anotherAnonId);

      expect(response.status).toBe(403);

      // Limpar
      await request(app)
        .delete(`/comments/${newCommentId}`)
        .set('Authorization', `Bearer ${teacherToken}`);
    });

    test('TEACHER pode deletar qualquer comentário', async () => {
      const createResponse = await request(app)
        .post('/comments')
        .set('x-anonymous-id', anonId)
        .send({ post_id: publishedPostId, content: 'Para deletar por teacher' });

      const newCommentId = createResponse.body.id;

      const response = await request(app)
        .delete(`/comments/${newCommentId}`)
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(response.status).toBe(204);
    });

    test('comentário inexistente retorna 404', async () => {
      const response = await request(app)
        .delete('/comments/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(response.status).toBe(404);
    });
  });
});
