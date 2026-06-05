'use strict';

const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/models');
const bcrypt = require('bcrypt');

beforeAll(async () => {
  await db.sequelize.sync({ force: true });
  const hash = await bcrypt.hash('senha123', 10);
  await db.User.create({ login: 'joao.silva', password_hash: hash, role: 'TEACHER' });
});

afterAll(async () => {
  await db.sequelize.close();
});

describe('POST /auth/login', () => {
  it('returns 200 with user, profile (null), token for valid credentials', async () => {
    const res = await request(app).post('/auth/login').send({ login: 'joao.silva', password: 'senha123' });
    expect(res.status).toBe(200);
    expect(res.body.user.login).toBe('joao.silva');
    expect(res.body.user.role).toBe('TEACHER');
    expect(res.body.profile).toBeNull();
    expect(res.body.token).toBeDefined();
  });

  it('returns 401 for wrong password', async () => {
    const res = await request(app).post('/auth/login').send({ login: 'joao.silva', password: 'wrong' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Credenciais inválidas');
  });

  it('returns 401 for nonexistent login', async () => {
    const res = await request(app).post('/auth/login').send({ login: 'nobody', password: 'senha123' });
    expect(res.status).toBe(401);
  });

  it('returns 400 if login missing', async () => {
    const res = await request(app).post('/auth/login').send({ password: 'senha123' });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });
});

describe('POST /auth/logout', () => {
  it('returns 204 with valid token', async () => {
    const login = await request(app).post('/auth/login').send({ login: 'joao.silva', password: 'senha123' });
    const token = login.body.token;
    const res = await request(app).post('/auth/logout').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(204);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).post('/auth/logout');
    expect(res.status).toBe(401);
  });
});

describe('PATCH /auth/password', () => {
  it('changes password and old password stops working', async () => {
    const login = await request(app).post('/auth/login').send({ login: 'joao.silva', password: 'senha123' });
    const token = login.body.token;

    const res = await request(app)
      .patch('/auth/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ current_password: 'senha123', new_password: 'newsecret8' });
    expect(res.status).toBe(204);

    const fail = await request(app).post('/auth/login').send({ login: 'joao.silva', password: 'senha123' });
    expect(fail.status).toBe(401);

    const success = await request(app).post('/auth/login').send({ login: 'joao.silva', password: 'newsecret8' });
    expect(success.status).toBe(200);
  });

  it('returns 400 if current_password incorrect', async () => {
    const login = await request(app).post('/auth/login').send({ login: 'joao.silva', password: 'newsecret8' });
    const token = login.body.token;

    const res = await request(app)
      .patch('/auth/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ current_password: 'wrong', new_password: 'anothersecret8' });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].field).toBe('current_password');
  });

  it('returns 400 if new_password too short', async () => {
    const login = await request(app).post('/auth/login').send({ login: 'joao.silva', password: 'newsecret8' });
    const token = login.body.token;

    const res = await request(app)
      .patch('/auth/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ current_password: 'newsecret8', new_password: 'short' });
    expect(res.status).toBe(400);
  });
});
