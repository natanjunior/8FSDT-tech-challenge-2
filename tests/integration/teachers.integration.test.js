'use strict';

const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/models');
const bcrypt = require('bcrypt');

let teacherToken;

beforeAll(async () => {
  await db.sequelize.sync({ force: true });
  const hash = await bcrypt.hash('senha123', 10);

  await db.Discipline.create({ id: '660e8400-e29b-41d4-a716-446655440001', label: 'Matemática' });
  await db.Discipline.create({ id: '660e8400-e29b-41d4-a716-446655440002', label: 'Português' });

  const user = await db.User.create({ login: 'admin.teacher', password_hash: hash, role: 'TEACHER' });
  await db.Teacher.create({
    id: 'Teacher/550e8400-e29b-41d4-a716-446655440001',
    name: 'Admin Teacher',
    user_id: user.id
  });

  const res = await request(app).post('/auth/login').send({ login: 'admin.teacher', password: 'senha123' });
  teacherToken = res.body.token;
});

afterAll(async () => {
  await db.sequelize.close();
});

describe('POST /teachers', () => {
  it('creates a teacher with user and disciplines', async () => {
    const res = await request(app)
      .post('/teachers')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        name: 'Nova Profa.',
        email: 'nova@x.com',
        pronouns: 'ela/dela',
        discipline_ids: ['660e8400-e29b-41d4-a716-446655440001'],
        user: { login: 'nova.profa', password: 'senha12345' }
      });
    expect(res.status).toBe(201);
    expect(res.body.id).toMatch(/^Teacher\//);
    expect(res.body.user.login).toBe('nova.profa');
    expect(res.body.disciplines).toHaveLength(1);
  });

  it('returns 403 if non-TEACHER tries to create', async () => {
    const studentUser = await db.User.create({ login: 's1', password_hash: 'x'.repeat(60), role: 'STUDENT' });
    await db.Student.create({ id: 'Student/550e8400-e29b-41d4-a716-446655440099', name: 'S1', user_id: studentUser.id });

    const studentToken = require('jsonwebtoken').sign(
      { id: studentUser.id, role: 'STUDENT', sessionId: 'fake', profileId: 'Student/550e8400-e29b-41d4-a716-446655440099' },
      process.env.JWT_SECRET, { expiresIn: '1h' }
    );

    const res = await request(app).post('/teachers')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ name: 'x' });
    expect([401, 403]).toContain(res.status);
  });
});

describe('GET /teachers', () => {
  it('lists teachers with pagination', async () => {
    const res = await request(app).get('/teachers').set('Authorization', `Bearer ${teacherToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.pagination).toBeDefined();
  });

  it('returns 401 unauthenticated', async () => {
    expect((await request(app).get('/teachers')).status).toBe(401);
  });
});

describe('GET /teachers/:id', () => {
  it('returns the teacher with disciplines and user (without password_hash)', async () => {
    const res = await request(app)
      .get('/teachers/Teacher/550e8400-e29b-41d4-a716-446655440001')
      .set('Authorization', `Bearer ${teacherToken}`);
    expect(res.status).toBe(200);
    expect(res.body.user.login).toBe('admin.teacher');
    expect(res.body.user.password_hash).toBeUndefined();
  });

  it('returns 404 if not found', async () => {
    const res = await request(app)
      .get('/teachers/Teacher/550e8400-e29b-41d4-a716-446655449999')
      .set('Authorization', `Bearer ${teacherToken}`);
    expect(res.status).toBe(404);
  });
});

describe('PATCH /teachers/:id', () => {
  it('updates teacher fields', async () => {
    const res = await request(app)
      .patch('/teachers/Teacher/550e8400-e29b-41d4-a716-446655440001')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ biography: 'Atualizada' });
    expect(res.status).toBe(200);
    expect(res.body.biography).toBe('Atualizada');
  });
});

describe('DELETE /teachers/:id', () => {
  it('soft-deletes the teacher and removes user', async () => {
    const u = await db.User.create({ login: 'tobedeleted', password_hash: 'x'.repeat(60), role: 'TEACHER' });
    const t = await db.Teacher.create({
      id: 'Teacher/550e8400-e29b-41d4-a716-446655440777',
      name: 'Delete Me',
      user_id: u.id
    });

    const res = await request(app)
      .delete(`/teachers/${t.id}`)
      .set('Authorization', `Bearer ${teacherToken}`);
    expect(res.status).toBe(204);

    const after = await db.Teacher.findByPk(t.id);
    expect(after.status).toBe('INATIVO');
    expect(after.user_id).toBeNull();

    const userGone = await db.User.findByPk(u.id);
    expect(userGone).toBeNull();
  });
});

describe('GET /teachers/me', () => {
  it('returns own teacher when token belongs to a teacher', async () => {
    const res = await request(app).get('/teachers/me').set('Authorization', `Bearer ${teacherToken}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe('Teacher/550e8400-e29b-41d4-a716-446655440001');
  });
});
