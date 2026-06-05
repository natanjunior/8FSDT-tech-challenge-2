'use strict';

class StudentService {
  constructor(studentRepository, userRepository) {
    this.studentRepository = studentRepository;
    this.userRepository = userRepository;
  }

  async list(filters) {
    const { count, rows } = await this.studentRepository.findAllPaginated(filters);
    const limit = parseInt(filters.limit) || 20;
    const page = parseInt(filters.page) || 1;
    return {
      data: rows.map((r) => this._serialize(r)),
      pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) }
    };
  }

  async getById(id) {
    const s = await this.studentRepository.findById(id);
    if (!s) {
      const err = new Error('Estudante não encontrado');
      err.status = 404;
      throw err;
    }
    return this._serializeFull(s);
  }

  async create(data, requester) {
    if (requester && requester.role === 'STUDENT') {
      const err = new Error('Estudantes não podem cadastrar outros estudantes');
      err.status = 403;
      throw err;
    }

    const { user: userPayload, ...studentFields } = data;
    return this.studentRepository.transaction(async (t) => {
      let userId = null;
      if (userPayload) {
        const existing = await this.userRepository.findByLogin(userPayload.login);
        if (existing) {
          const err = new Error('Login já em uso');
          err.status = 409;
          err.field = 'user.login';
          throw err;
        }
        const created = await this.userRepository.create({ ...userPayload, role: 'STUDENT' }, { transaction: t });
        userId = created.id;
      }
      const s = await this.studentRepository.create({ ...studentFields, user_id: userId }, { transaction: t });
      return this.getById(s.id);
    });
  }

  async update(id, data, requester) {
    const existing = await this.studentRepository.findById(id);
    if (!existing) {
      const err = new Error('Estudante não encontrado');
      err.status = 404;
      throw err;
    }
    this._assertCanModify(existing, requester);
    return this.studentRepository.transaction(async (t) => {
      await this.studentRepository.update(id, data, { transaction: t });
      return this.getById(id);
    });
  }

  async delete(id) {
    const s = await this.studentRepository.findById(id);
    if (!s) {
      const err = new Error('Estudante não encontrado');
      err.status = 404;
      throw err;
    }
    return this.studentRepository.transaction(async (t) => {
      await this.studentRepository.update(id, { status: 'INATIVO', user_id: null }, { transaction: t });
      if (s.user_id) {
        await this.userRepository.delete(s.user_id, { transaction: t });
      }
    });
  }

  _assertCanModify(student, requester) {
    if (!requester) { const e = new Error('Não autenticado'); e.status = 401; throw e; }
    if (requester.role === 'TEACHER') return;
    if (student.user_id && student.user_id === requester.id) return;
    const e = new Error('Sem permissão'); e.status = 403; throw e;
  }

  _serialize(s) {
    const p = typeof s.toJSON === 'function' ? s.toJSON() : s;
    return {
      id: p.id, name: p.name, email: p.email, birth_date: p.birth_date,
      pronouns: p.pronouns, biography: p.biography, status: p.status,
      course: p.course,
      created_at: p.created_at || p.createdAt,
      updated_at: p.updated_at || p.updatedAt
    };
  }

  _serializeFull(s) {
    const base = this._serialize(s);
    const p = typeof s.toJSON === 'function' ? s.toJSON() : s;
    base.user = p.user ? { id: p.user.id, login: p.user.login, role: p.user.role } : null;
    return base;
  }
}

module.exports = StudentService;
