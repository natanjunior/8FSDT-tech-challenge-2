'use strict';

const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/models');
const bcrypt = require('bcrypt');

let teacherToken, studentToken;

beforeAll(async () => {
  await db.sequelize.sync({ force: true });
  const hash = await bcrypt.hash('senha123', 10);

  const teacherUser = await db.User.create({ login: 'admin', password_hash: hash, role: 'TEACHER' });
  await db.Teacher.create({ id: 'Teacher/550e8400-e29b-41d4-a716-446655440001', name: 'Admin', user_id: teacherUser.id });
  teacherToken = (await request(app).post('/auth/login').send({ login: 'admin', password: 'senha123' })).body.token;

  const studentUser = await db.User.create({ login: 'al', password_hash: hash, role: 'STUDENT' });
  await db.Student.create({ id: 'Student/550e8400-e29b-41d4-a716-446655440099', name: 'Al', user_id: studentUser.id });
  studentToken = (await request(app).post('/auth/login').send({ login: 'al', password: 'senha123' })).body.token;
});

afterAll(async () => { await db.sequelize.close(); });

describe('POST /students (public + STUDENT block)', () => {
  it('allows anonymous to create', async () => {
    const res = await request(app).post('/students').send({
      name: 'Visitor Student',
      user: { login: 'novo.aluno', password: 'senha12345' }
    });
    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('STUDENT');
  });

  it('allows TEACHER to create', async () => {
    const res = await request(app).post('/students').set('Authorization', `Bearer ${teacherToken}`)
      .send({ name: 'Outro Aluno' });
    expect(res.status).toBe(201);
  });

  it('returns 403 when STUDENT tries to create', async () => {
    const res = await request(app).post('/students').set('Authorization', `Bearer ${studentToken}`)
      .send({ name: 'x' });
    expect(res.status).toBe(403);
  });
});

describe('GET /students', () => {
  it('requires TEACHER', async () => {
    expect((await request(app).get('/students')).status).toBe(401);
    expect((await request(app).get('/students').set('Authorization', `Bearer ${studentToken}`)).status).toBe(403);
    expect((await request(app).get('/students').set('Authorization', `Bearer ${teacherToken}`)).status).toBe(200);
  });
});

describe('PATCH /students/:id', () => {
  it('STUDENT can update own profile', async () => {
    const res = await request(app)
      .patch('/students/Student/550e8400-e29b-41d4-a716-446655440099')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ biography: 'Atualizei minha bio' });
    expect(res.status).toBe(200);
    expect(res.body.biography).toBe('Atualizei minha bio');
  });

  it('STUDENT cannot edit another student', async () => {
    const u = await db.User.create({ login: 'al2', password_hash: 'x'.repeat(60), role: 'STUDENT' });
    await db.Student.create({ id: 'Student/550e8400-e29b-41d4-a716-446655440100', name: 'Al2', user_id: u.id });

    const res = await request(app)
      .patch('/students/Student/550e8400-e29b-41d4-a716-446655440100')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ biography: 'hacker' });
    expect(res.status).toBe(403);
  });
});

describe('DELETE /students/:id', () => {
  it('soft-deletes and frees login', async () => {
    const u = await db.User.create({ login: 'tobegone', password_hash: 'x'.repeat(60), role: 'STUDENT' });
    const s = await db.Student.create({ id: 'Student/550e8400-e29b-41d4-a716-446655440777', name: 'Bye', user_id: u.id });

    const res = await request(app).delete(`/students/${s.id}`).set('Authorization', `Bearer ${teacherToken}`);
    expect(res.status).toBe(204);

    const after = await db.Student.findByPk(s.id);
    expect(after.status).toBe('INATIVO');
    expect(after.user_id).toBeNull();
    expect(await db.User.findByPk(u.id)).toBeNull();
  });
});
