'use strict';

const db = require('../../src/models');

describe('models registry', () => {
  it('loads all models with associations', () => {
    expect(db.User).toBeDefined();
    expect(db.Teacher).toBeDefined();
    expect(db.Student).toBeDefined();
    expect(db.TeacherDiscipline).toBeDefined();
    expect(db.Post).toBeDefined();
    expect(db.Comment).toBeDefined();
    expect(db.PostRead).toBeDefined();
    expect(db.Discipline).toBeDefined();
    expect(db.UserSession).toBeDefined();
  });

  it('Teacher has belongsToMany association to Discipline', () => {
    expect(db.Teacher.associations.disciplines).toBeDefined();
    expect(db.Teacher.associations.disciplines.target).toBe(db.Discipline);
  });

  it('User has hasOne associations to Teacher and Student', () => {
    expect(db.User.associations.teacher).toBeDefined();
    expect(db.User.associations.student).toBeDefined();
  });

  it('Post.author FK targets Teacher.id', () => {
    expect(db.Post.associations.author_teacher).toBeDefined();
    expect(db.Post.associations.author_teacher.target).toBe(db.Teacher);
  });
});
