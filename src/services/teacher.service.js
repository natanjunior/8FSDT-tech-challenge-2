'use strict';

class TeacherService {
  constructor(teacherRepository, userRepository) {
    this.teacherRepository = teacherRepository;
    this.userRepository = userRepository;
  }

  async list(filters) {
    const { count, rows } = await this.teacherRepository.findAllPaginated(filters);
    const limit = parseInt(filters.limit) || 20;
    const page = parseInt(filters.page) || 1;
    return {
      data: rows.map((r) => this._serialize(r)),
      pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) }
    };
  }

  async getById(id) {
    const teacher = await this.teacherRepository.findById(id);
    if (!teacher) {
      const err = new Error('Professor não encontrado');
      err.status = 404;
      throw err;
    }
    return this._serializeFull(teacher);
  }

  _pickFields(data) {
    const allowed = ['name', 'email', 'birth_date', 'pronouns', 'biography', 'status'];
    const out = {};
    for (const key of allowed) {
      if (data[key] !== undefined) out[key] = data[key];
    }
    return out;
  }

  async create(data) {
    const { discipline_ids, user: userPayload } = data;
    const teacherFields = this._pickFields(data);

    if (discipline_ids && !(await this.teacherRepository.disciplinesExist(discipline_ids))) {
      const err = new Error('Disciplinas inválidas');
      err.status = 400;
      err.field = 'discipline_ids';
      throw err;
    }

    return this.teacherRepository.transaction(async (t) => {
      let userId = null;
      if (userPayload) {
        const existing = await this.userRepository.findByLogin(userPayload.login);
        if (existing) {
          const err = new Error('Login já em uso');
          err.status = 409;
          err.field = 'user.login';
          throw err;
        }
        const created = await this.userRepository.create({ ...userPayload, role: 'TEACHER' }, { transaction: t });
        userId = created.id;
      }

      const teacher = await this.teacherRepository.create({ ...teacherFields, user_id: userId }, { transaction: t });
      if (discipline_ids && discipline_ids.length) {
        await this.teacherRepository.setDisciplines(teacher.id, discipline_ids, { transaction: t });
      }
      return this.getById(teacher.id);
    });
  }

  async update(id, data, requester) {
    const existing = await this.teacherRepository.findById(id);
    if (!existing) {
      const err = new Error('Professor não encontrado');
      err.status = 404;
      throw err;
    }
    this._assertCanModify(existing, requester);

    const { discipline_ids } = data;
    const teacherFields = this._pickFields(data);
    return this.teacherRepository.transaction(async (t) => {
      await this.teacherRepository.update(id, teacherFields, { transaction: t });
      if (Array.isArray(discipline_ids)) {
        if (!(await this.teacherRepository.disciplinesExist(discipline_ids))) {
          const err = new Error('Disciplinas inválidas');
          err.status = 400;
          err.field = 'discipline_ids';
          throw err;
        }
        await this.teacherRepository.setDisciplines(id, discipline_ids, { transaction: t });
      }
      return this.getById(id);
    });
  }

  async delete(id) {
    const teacher = await this.teacherRepository.findById(id);
    if (!teacher) {
      const err = new Error('Professor não encontrado');
      err.status = 404;
      throw err;
    }
    return this.teacherRepository.transaction(async (t) => {
      await this.teacherRepository.update(id, { status: 'INATIVO', user_id: null }, { transaction: t });
      if (teacher.user_id) {
        await this.userRepository.delete(teacher.user_id, { transaction: t });
      }
    });
  }

  _assertCanModify(teacher, requester) {
    if (!requester) {
      const err = new Error('Não autenticado');
      err.status = 401;
      throw err;
    }
    if (requester.role === 'TEACHER') return;
    if (teacher.user_id && teacher.user_id === requester.id) return;
    const err = new Error('Sem permissão');
    err.status = 403;
    throw err;
  }

  _serialize(teacher) {
    const plain = typeof teacher.toJSON === 'function' ? teacher.toJSON() : teacher;
    return {
      id: plain.id,
      name: plain.name,
      email: plain.email,
      birth_date: plain.birth_date,
      pronouns: plain.pronouns,
      biography: plain.biography,
      status: plain.status,
      disciplines: (plain.disciplines || []).map((d) => ({ id: d.id, label: d.label })),
      created_at: plain.created_at || plain.createdAt,
      updated_at: plain.updated_at || plain.updatedAt
    };
  }

  _serializeFull(teacher) {
    const base = this._serialize(teacher);
    const plain = typeof teacher.toJSON === 'function' ? teacher.toJSON() : teacher;
    base.user = plain.user
      ? { id: plain.user.id, login: plain.user.login, role: plain.user.role }
      : null;
    return base;
  }
}

module.exports = TeacherService;
